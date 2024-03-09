export interface ProductsResponse {
    page: number;
    limit: number;
    total: number;
    products: Product[]
}

export interface Product {
    id: string;
    title: string;
    price: number;
    img: string;
    desc: string;
    sellerId: string;
}