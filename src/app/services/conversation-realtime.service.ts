import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Conversation, ConversationDisabledReason } from '../interfaces/conversation.interface';

export interface ConversationRealtimeSnapshot {
  enabled: boolean;
  disabledReason?: ConversationDisabledReason;
  lastMessageAt?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ConversationRealtimeService {
  private firestore = inject(Firestore);

  observeConversation(id: string): Observable<ConversationRealtimeSnapshot> {
    const conversationRef = doc(this.firestore, `conversations/${id}`);

    return docData(conversationRef, { idField: 'id' }).pipe(
      map((conversation) => {
        const typedConversation = conversation as Conversation;

        return {
          enabled: typedConversation.enabled,
          disabledReason: typedConversation.disabledReason,
          lastMessageAt: this.toDate(typedConversation.lastMessageAt)?.getTime(),
        };
      }),
    );
  }

  private toDate(value: unknown): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      return (value as { toDate: () => Date }).toDate();
    }

    return new Date(value as string);
  }
}
