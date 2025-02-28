import { Product } from "./product.interface";

export interface ProductsResponse {
    page: number;
    limit: number;
    total: number;
    products: Product[]
}