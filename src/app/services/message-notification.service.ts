import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { Subscription, combineLatest } from 'rxjs';
import { Conversation } from '../interfaces/conversation.interface';
import { Message } from '../interfaces/message.interface';
import { MessageNotificationToast } from '../interfaces/message-notification.interface';
import { ConversationsService } from './conversations.service';
import { ErrorResponse, SuccessResponse } from '../interfaces/response-interface';

interface ConversationActivitySnapshot {
  lastMessageAt: number;
  lastMessageSenderId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessageNotificationService implements OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  private readonly conversationsService = inject(ConversationsService);

  private readonly autoDismissMs = 6000;
  private readonly maxVisibleToasts = 4;

  public toasts = signal<MessageNotificationToast[]>([]);

  private conversationsSubscription?: Subscription;
  private currentUserId?: string;
  private readonly activityBaseline = new Map<string, ConversationActivitySnapshot>();
  private readonly dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

  ngOnDestroy(): void {
    this.stop();
  }

  start(userId: string): void {
    if (this.currentUserId === userId && this.conversationsSubscription) {
      return;
    }

    this.stop();
    this.currentUserId = userId;
    this.activityBaseline.clear();

    const conversationsRef = collection(this.firestore, 'conversations');
    const asBuyerQuery = query(conversationsRef, where('buyerId', '==', userId));
    const asSellerQuery = query(conversationsRef, where('sellerId', '==', userId));

    this.conversationsSubscription = combineLatest([
      collectionData(asBuyerQuery, { idField: 'id' }),
      collectionData(asSellerQuery, { idField: 'id' }),
    ]).subscribe({
      next: ([buyerConversations, sellerConversations]) => {
        const conversationsById = new Map<string, Conversation>();

        for (const conversation of [...buyerConversations, ...sellerConversations]) {
          const typedConversation = conversation as Conversation;
          if (typedConversation.id) {
            conversationsById.set(typedConversation.id, typedConversation);
          }
        }

        for (const conversation of conversationsById.values()) {
          this.handleConversationUpdate(conversation);
        }
      },
      error: (error) => {
        console.error('Message notification listener failed', error);
      },
    });
  }

  stop(): void {
    this.conversationsSubscription?.unsubscribe();
    this.conversationsSubscription = undefined;
    this.currentUserId = undefined;
    this.activityBaseline.clear();
    this.clearAllDismissTimers();
    this.toasts.set([]);
  }

  dismiss(toastId: string): void {
    const timer = this.dismissTimers.get(toastId);
    if (timer) {
      clearTimeout(timer);
      this.dismissTimers.delete(toastId);
    }

    this.toasts.update((current) => current.filter((toast) => toast.id !== toastId));
  }

  openConversation(toast: MessageNotificationToast): void {
    this.dismiss(toast.id);
    void this.router.navigate(['/user/messages', toast.conversationId]);
  }

  private handleConversationUpdate(conversation: Conversation): void {
    const userId = this.currentUserId;
    const conversationId = conversation.id;

    if (!userId || !conversationId) {
      return;
    }

    const lastMessageAt = this.toTimestamp(conversation.lastMessageAt);
    if (lastMessageAt == null) {
      return;
    }

    const previousActivity = this.activityBaseline.get(conversationId);
    if (!previousActivity) {
      this.activityBaseline.set(conversationId, {
        lastMessageAt,
        lastMessageSenderId: conversation.lastMessageSenderId,
      });
      return;
    }

    if (lastMessageAt <= previousActivity.lastMessageAt) {
      return;
    }

    const sinceTimestamp = previousActivity.lastMessageAt;

    this.activityBaseline.set(conversationId, {
      lastMessageAt,
      lastMessageSenderId: conversation.lastMessageSenderId,
    });

    if (conversation.lastMessageSenderId === userId) {
      return;
    }

    if (this.isViewingConversation(conversationId)) {
      return;
    }

    this.fetchPreviewAndNotify(conversation, lastMessageAt, sinceTimestamp);
  }

  private fetchPreviewAndNotify(
    conversation: Conversation,
    lastMessageAt: number,
    sinceTimestamp: number,
  ): void {
    const userId = this.currentUserId;
    const conversationId = conversation.id;

    if (!userId || !conversationId) {
      return;
    }

    const since = new Date(sinceTimestamp).toISOString();

    this.conversationsService.getMessages(conversationId, since).subscribe({
      next: (response) => {
        let preview = 'Nuevo mensaje';

        if (response instanceof SuccessResponse) {
          const messages = response.data as Message[];
          const lastIncoming = [...messages]
            .reverse()
            .find((message) => message.senderId !== userId);

          if (lastIncoming?.content) {
            preview = lastIncoming.content;
          }
        } else if (response instanceof ErrorResponse) {
          console.error('Could not load message preview', response.error);
        }

        if (this.isViewingConversation(conversationId)) {
          return;
        }

        this.pushToast({
          id: `${conversationId}-${lastMessageAt}`,
          conversationId,
          productTitle: conversation.productTitle,
          productImage: conversation.productImage,
          preview,
        });
      },
    });
  }

  private pushToast(toast: MessageNotificationToast): void {
    this.toasts.update((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== toast.id);
      return [...withoutDuplicate, toast].slice(-this.maxVisibleToasts);
    });

    const timer = setTimeout(() => this.dismiss(toast.id), this.autoDismissMs);
    this.dismissTimers.set(toast.id, timer);
  }

  private isViewingConversation(conversationId: string): boolean {
    return this.router.url.includes(`/user/messages/${conversationId}`);
  }

  private clearAllDismissTimers(): void {
    for (const timer of this.dismissTimers.values()) {
      clearTimeout(timer);
    }
    this.dismissTimers.clear();
  }

  private toTimestamp(value: string | Date | unknown): number | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      return (value as { toDate: () => Date }).toDate().getTime();
    }

    const parsed = new Date(value as string);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.getTime();
  }
}
