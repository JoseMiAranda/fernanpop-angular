import { TransactionReview } from './review.interface';

export enum StatusTransaction {
    IN_PROCESS = 'in-process',
    RECEIVED = 'received',
    CANCELED = 'canceled',
}

export interface Transaction {
    id: string;
    productId: string;
    productSlug?: string;
    sellerId: string;
    buyerId: string;
    sellerEmail: string;
    sellerName?: string;
    buyerName?: string;
    title: string;
    price: number;
    image: string;
    status: StatusTransaction;
    createdAt: Date;
    updatedAt: Date;
    review?: TransactionReview;
}
