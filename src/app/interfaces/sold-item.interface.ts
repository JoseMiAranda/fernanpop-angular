export interface SoldItemReview {
  score: number;
  description?: string;
  createdAt: string;
}

export interface SoldItem {
  id?: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  soldAt: string;
  review?: SoldItemReview;
}
