export enum ProductStatus {
    RESERVED = 'reserved',
    SOLD = 'sold',
}

export interface Product {
    id: string;
    sellerId: string;
    title: string;
    desc: string;
    price: number;
    images: string[];
    categoryId?: string;
    createdAt: Date;
    updatedAt: Date;
    status: ProductStatus[];
}