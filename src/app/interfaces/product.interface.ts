export enum ProductStatus {
    INITIAL = 'initial',
    RESERVED = 'reserved',
    SOLD = 'sold',
}

export interface Product {
    id: string;
    sellerId: string;
    title: string;
    desc: string;
    price: number;
    img: string;
    createdAt: Date;
    updatedAt: Date;
    status: ProductStatus;
}