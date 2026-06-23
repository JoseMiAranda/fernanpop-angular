import { SellerSummary } from './seller.interface';

export enum ProductStatus {
    RESERVED = 'reserved',
    SOLD = 'sold',
}

export enum ProductCondition {
    NEW = 'nuevo',
    LIKE_NEW = 'casi_nuevo',
    GOOD = 'buen_estado',
    WORN = 'desgastado',
}

export interface ProductConditionOption {
    id: ProductCondition;
    name: string;
}

export const PRODUCT_CONDITIONS: ProductConditionOption[] = [
    { id: ProductCondition.NEW, name: 'Nuevo' },
    { id: ProductCondition.LIKE_NEW, name: 'Casi nuevo' },
    { id: ProductCondition.GOOD, name: 'Buen estado' },
    { id: ProductCondition.WORN, name: 'Desgastado' },
];

export interface Product {
    id: string;
    slug?: string;
    sellerId: string;
    title: string;
    desc: string;
    price: number;
    images: string[];
    categoryId?: string;
    condition?: ProductCondition;
    createdAt: Date;
    updatedAt: Date;
    status: ProductStatus[];
    seller?: SellerSummary;
}