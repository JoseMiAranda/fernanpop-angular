import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Conversation } from '../../../../interfaces/conversation.interface';
import { CustomResponse, ErrorResponse, SuccessResponse } from '../../../../interfaces/response-interface';
import { ConversationsService } from '../../../../services/conversations.service';
import { ErrorState, LoadingState, State, SuccessState } from '../../../../states/state.interface';
import {
  BreadcrumbsComponent,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  PageContainerComponent,
  PageTitleComponent,
} from '../../../../shared/ui';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    PageContainerComponent,
    PageTitleComponent,
    BreadcrumbsComponent,
    EmptyStateComponent,
    CardComponent,
    ButtonComponent,
  ],
  templateUrl: './inbox.component.html',
})
export class InboxComponent implements OnInit, OnDestroy {
  public conversationsState = signal<State>(new LoadingState());
  public currentUser = this.authService.currentUser;
  private conversationsSubscription: Subscription = new Subscription();

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.conversationsSubscription.unsubscribe();
  }

  loadConversations(): void {
    this.conversationsState.set(new LoadingState());
    this.conversationsSubscription.unsubscribe();
    this.conversationsSubscription = this.conversationsService.getConversations().subscribe({
      next: (response: CustomResponse) => {
        if (response instanceof SuccessResponse) {
          this.conversationsState.set(
            new SuccessState(this.normalizeConversations(response.data as Conversation[])),
          );
        } else if (response instanceof ErrorResponse) {
          this.conversationsState.set(new ErrorState(response.error));
        }
      },
    });
  }

  otherParticipantName(conversation: Conversation): string {
    const currentUserId = this.currentUser()?.uid;
    return currentUserId === conversation.sellerId
      ? conversation.buyerName ?? 'Comprador'
      : conversation.sellerName ?? 'Vendedor';
  }

  closedLabel(conversation: Conversation): string {
    return conversation.disabledReason === 'deleted' ? 'Eliminado' : 'Cerrado';
  }

  private normalizeConversations(conversations: Conversation[]): Conversation[] {
    return conversations.map((conversation) => ({
      ...conversation,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      lastMessageAt: new Date(conversation.lastMessageAt),
    }));
  }
}
