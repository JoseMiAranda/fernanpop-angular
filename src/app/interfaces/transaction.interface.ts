export enum StatusTransaction {
    IN_PROCESS = 'in-process',
    RECEIVED = 'received',
    CANCELED = 'canceled',
}

export interface Transaction {
    id: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    createdAt: string;
    updatedAt: string;
    status: StatusTransaction;
}