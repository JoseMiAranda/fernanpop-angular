export enum ProductStatus {
    RESERVED = 'reserved',
    SELLED = 'selled',
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