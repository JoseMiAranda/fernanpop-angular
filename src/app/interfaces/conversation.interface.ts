export type ConversationDisabledReason = 'sold' | 'deleted';

export interface Conversation {
  id: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  buyerId: string;
  sellerName?: string;
  buyerName?: string;
  enabled: boolean;
  disabledReason?: ConversationDisabledReason;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastMessageAt: string | Date;
  lastMessageSenderId?: string;
}
