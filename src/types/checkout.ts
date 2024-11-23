export interface CheckoutItem {
    id: number;
    courseId: number;
    originalPrice: number;
    title: string;
    shortDescription: string;
    imageUrl: string;
    discountPrice: number;
    averageRating: number;
    totalStudents: number;
    isDiscount: boolean;
}

export interface CheckoutDraft {
    id: number;
    cartId: number;
    studentId: number;
    totalPrice: number;
    point: number;
    discountCodeId: number | null;
    totalDiscount: number;
    totalPriceAfterDiscount: number;
    transactionId: string;
    items: CheckoutItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CheckoutDraftResponse {
    error_message: string;
    code: number;
    data: {
        checkout_draft: CheckoutDraft | null;
    };
}