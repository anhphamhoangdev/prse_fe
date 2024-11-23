import {request} from "../utils/request";
import {PaymentMethod, PaymentMethodResponse} from "../types/payment";
import {ENDPOINTS} from "../constants/endpoint";

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