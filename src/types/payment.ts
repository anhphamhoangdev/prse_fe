export interface PaymentMethod {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
    logoUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentMethodResponse {
    error_message: string;
    code: number;
    data: {
        payment_method: PaymentMethod[];
    }
}
export interface PaymentStatusUpdate {
    code: string;
    id: string;
    status: string;
    orderCode: string;
    cancel: boolean;
}


