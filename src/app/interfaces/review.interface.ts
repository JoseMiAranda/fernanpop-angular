export interface TransactionReview {
    score: number;
    description?: string;
    createdAt: string;
}

export interface Review {
    id: string;
    transactionId: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    score: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SellerReviewsSummary {
    averageScore: number;
    totalReviews: number;
    reviews: Review[];
}

export interface CreateReviewPayload {
    score: number;
    description?: string;
}
