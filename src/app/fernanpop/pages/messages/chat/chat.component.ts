import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Conversation } from '../../../../interfaces/conversation.interface';
import { Message } from '../../../../interfaces/message.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { AuthService } from '../../../../services/auth.service';
import { ConversationRealtimeService } from '../../../../services/conversation-realtime.service';
import { ConversationsService } from '../../../../services/conversations.service';
import { ErrorState, InitialState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import { ButtonComponent, CardComponent, EmptyStateComponent, PageContainerComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    PageContainerComponent,
    CardComponent,
    ButtonComponent,
    EmptyStateComponent,
  ],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input('id') conversationId: string | undefined;
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  public currentUser = this.authService.currentUser;
  public conversationState = signal<State>(new LoadingState());
  public messagesState = signal<State>(new LoadingState());
  public sendMessageState = signal<State>(new InitialState());
  public messageDraft = '';

  private conversationSubscription: Subscription = new Subscription();
  private messagesSubscription: Subscription = new Subscription();
  private sendMessageSubscription: Subscription = new Subscription();
  private conversationRealtimeSubscription: Subscription = new Subscription();
  private lastObservedMessageAt?: number;
  private latestLoadedAt?: string;
  private shouldScrollToBottom = false;

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly conversationRealtimeService: ConversationRealtimeService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.conversationId) {
      this.router.navigate(['/user/messages']);
      return;
    }

    this.loadConversation();
    this.loadMessages();
    this.subscribeToRealtime();
  }

  ngOnDestroy(): void {
    this.conversationSubscription.unsubscribe();
    this.messagesSubscription.unsubscribe();
    this.sendMessageSubscription.unsubscribe();
    this.conversationRealtimeSubscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom || !this.messagesContainer) {
      return;
    }

    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    this.shouldScrollToBottom = false;
  }

  sendMessage(): void {
    if (this.sendMessageState().type === 'loading') {
      return;
    }

    if (this.conversationState().type !== 'success') {
      return;
    }

    const content = this.messageDraft.trim();

    if (!content || !this.conversationState().data.enabled) {
      return;
    }

    this.sendMessageState.set(new LoadingState());
    this.sendMessageSubscription.unsubscribe();
    this.sendMessageSubscription = this.conversationsService
      .sendMessage(this.conversationId!, content)
      .subscribe({
        next: (response: CustomResponse) => {
          if (response instanceof SuccessResponse) {
            this.messageDraft = '';
            this.sendMessageState.set(new InitialState());
            this.mergeMessages([this.normalizeMessage(response.data as Message)]);
          } else if (response instanceof ErrorResponse) {
            this.sendMessageState.set(new ErrorState(response.error));
            this.loadConversation();
          }
        },
      });
  }

  otherParticipantName(): string {
    if (this.conversationState().type !== 'success') {
      return '';
    }

    const conversation = this.conversationState().data as Conversation;
    const currentUserId = this.currentUser()?.uid;

    return currentUserId === conversation.sellerId
      ? conversation.buyerName ?? 'Comprador'
      : conversation.sellerName ?? 'Vendedor';
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUser()?.uid;
  }

  closedMessage(): string {
    if (this.conversationState().type !== 'success') {
      return 'Esta conversación está cerrada porque el producto ya no está disponible.';
    }

    return this.conversationState().data.disabledReason === 'deleted'
      ? 'Esta conversación está cerrada porque el producto ha sido eliminado.'
      : 'Esta conversación está cerrada porque el producto ya ha sido vendido.';
  }

  retryMessages(): void {
    this.loadConversation();
    this.loadMessages();
  }

  private loadConversation(): void {
    this.conversationSubscription.unsubscribe();
    this.conversationSubscription = this.conversationsService.getConversation(this.conversationId!).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.conversationState.set(new SuccessState(this.normalizeConversation(response.data as Conversation)));
        } else if (response instanceof ErrorResponse) {
          this.conversationState.set(new ErrorState(response.error));
        }
      },
    });
  }

  private loadMessages(since?: string): void {
    if (!since) {
      this.messagesState.set(new LoadingState());
    }

    this.messagesSubscription.unsubscribe();
    this.messagesSubscription = this.conversationsService.getMessages(this.conversationId!, since).subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          const normalizedMessages = (response.data as Message[]).map((message) => this.normalizeMessage(message));
          if (since) {
            this.mergeMessages(normalizedMessages);
          } else {
            this.messagesState.set(new SuccessState(normalizedMessages));
            this.updateLatestLoadedAt(normalizedMessages);
            this.shouldScrollToBottom = true;
          }
        } else if (response instanceof ErrorResponse) {
          this.messagesState.set(new ErrorState(response.error));
        }
      },
    });
  }

  private subscribeToRealtime(): void {
    this.conversationRealtimeSubscription = this.conversationRealtimeService
      .observeConversation(this.conversationId!)
      .subscribe({
        next: (conversationRealtime) => {
          if (this.conversationState().type === 'success') {
            const currentConversation = this.conversationState().data as Conversation;
            this.conversationState.set(new SuccessState({
              ...currentConversation,
              enabled: conversationRealtime.enabled,
              disabledReason: conversationRealtime.disabledReason,
            }));
          }

          const lastMessageAt = conversationRealtime.lastMessageAt;
          if (lastMessageAt == null) {
            return;
          }

          if (this.lastObservedMessageAt === lastMessageAt) {
            return;
          }

          const hadPreviousSnapshot = this.lastObservedMessageAt !== undefined;
          this.lastObservedMessageAt = lastMessageAt;

          if (!hadPreviousSnapshot) {
            return;
          }

          this.loadMessages(this.latestLoadedAt);
        },
        error: (error) => {
          console.error('Firestore realtime listener failed', error);
        },
      });
  }

  private mergeMessages(incomingMessages: Message[]): void {
    const currentMessages =
      this.messagesState().type === 'success' ? [...(this.messagesState().data as Message[])] : [];
    const merged = new Map<string, Message>();

    for (const message of currentMessages) {
      merged.set(message.id, message);
    }

    for (const message of incomingMessages) {
      merged.set(message.id, message);
    }

    const sortedMessages = Array.from(merged.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    this.messagesState.set(new SuccessState(sortedMessages));
    this.updateLatestLoadedAt(sortedMessages);
    this.shouldScrollToBottom = incomingMessages.length > 0;
  }

  private updateLatestLoadedAt(messages: Message[]): void {
    const lastMessage = messages[messages.length - 1];
    this.latestLoadedAt = lastMessage ? new Date(lastMessage.createdAt).toISOString() : undefined;
  }

  private normalizeConversation(conversation: Conversation): Conversation {
    return {
      ...conversation,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      lastMessageAt: new Date(conversation.lastMessageAt),
    };
  }

  private normalizeMessage(message: Message): Message {
    return {
      ...message,
      createdAt: new Date(message.createdAt),
    };
  }
}
