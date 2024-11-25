import {request, requestPostWithAuth, requestPostWithAuthFullResponse} from "../utils/request";
import {PaymentMethod, PaymentMethodResponse, PaymentStatusUpdate} from "../types/payment";
import {ENDPOINTS} from "../constants/endpoint";
import {CheckoutDraft} from "../types/checkout";

export interface CreatePaymentRequest {
    checkoutDraftId: number;
    paymentMethodId: number;
    studentId: number;
    totalAmount: number;
    items: {
        id: number;
        courseId: number;
        title: string;
        price: number;
    }[];
}

export interface PaymentResponse {
    error_message?: Record<string, unknown>;
    code: number;
    data: {
        payment_info: {
            bin: string;
            accountNumber: string;
            accountName: string;
            amount: number;
            description: string;
            orderCode: number;
            currency: string;
            paymentLinkId: string;
            status: 'PENDING' | 'COMPLETED' | 'FAILED';
            checkoutUrl: string;
            qrCode: string;
        };
    };
}


export async function getPaymentMethods(): Promise<PaymentMethod[]> {
    console.log('[PaymentService] Fetching payment methods');
    try {
        const response = await request<PaymentMethodResponse>(
            ENDPOINTS.PAYMENT.GET_ALL_METHODS
        );

        console.log("console.log ====>>",response);

        if (response.code !== 1) {
            throw new Error(response.error_message || 'Failed to fetch payment methods');
        }

        console.log('[PaymentService] Payment methods fetched:', response.data.payment_method);
        return response.data.payment_method;
    } catch (error) {
        console.error('[PaymentService] Error fetching payment methods:', error);
        throw error;
    }
}

export async function createPayment(
    checkoutDraft: CheckoutDraft,
    paymentMethodId: number
): Promise<PaymentResponse> {
    console.log('[PaymentService] Creating payment for checkout:', checkoutDraft.id);

    try {
        const paymentRequest: CreatePaymentRequest = {
            checkoutDraftId: checkoutDraft.id,
            paymentMethodId,
            studentId: checkoutDraft.studentId,
            totalAmount: checkoutDraft.totalPriceAfterDiscount,
            items: checkoutDraft.items.map(item => ({
                id: item.id,
                courseId: item.courseId,
                title: item.title,
                price: item.isDiscount && item.discountPrice ? item.discountPrice : item.originalPrice
            }))
        };

        console.log('[PaymentService] Payment request:', paymentRequest);

        const response = await requestPostWithAuthFullResponse<PaymentResponse>(
            ENDPOINTS.PAYMENT.CREATE,
            paymentRequest
        );

        console.log('[PaymentService] Payment created successfully:', response);
        return response;

    } catch (error) {
        console.error('[PaymentService] Error creating payment:', error);
        throw error;
    }
}


export const updatePaymentStatus = async (data: PaymentStatusUpdate) => {
    try {
        const response = await requestPostWithAuth(
            ENDPOINTS.PAYMENT.UPDATE_STATUS,
            data
        );
        return response;
    } catch (error) {
        throw new Error('Failed to update payment status');
    }
};

