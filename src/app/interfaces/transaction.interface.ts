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
    title: string;
    price: number;
    image: string;
    status: StatusTransaction;
    createdAt: Date;
    updatedAt: Date;
}