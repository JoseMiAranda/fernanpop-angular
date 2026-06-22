import { SoldItemReview } from './sold-item.interface';

export interface PurchasedItem {
  id?: string;
  productId: string;
  sellerId: string;
  sellerEmail: string;
  title: string;
  price: number;
  image: string;
  purchasedAt: string;
  review?: SoldItemReview;
}
