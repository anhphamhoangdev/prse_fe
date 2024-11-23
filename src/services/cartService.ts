import {ENDPOINTS} from "../constants/endpoint";
import {
    request,
    requestDelete,
    requestPost,
    requestPostWithAuth,
    requestPostWithAuthFullResponse,
    requestWithAuth
} from "../utils/request";
import {CheckoutDraft, CheckoutDraftResponse} from "../types/checkout";

export interface CartItem {
    id: number;
    courseId: number;
    originalPrice: number;
    title: string;
    shortDescription: string;
    imageUrl: string;
    discountPrice: number | null;
    averageRating: number;
    totalStudents: number;
    isDiscount: boolean;
}

export interface Cart {
    id: number;
    totalPrice: number;
    items: CartItem[];
}

export interface CartResponse {
    cart: Cart;
}

interface DeleteResponse {
    error_message: Record<string, never>;
    code: number;
    data: Record<string, never>;
}

export async function getCart(): Promise<Cart> {
    console.log('[CartService] Fetching cart');
    try {
        const response = await requestWithAuth<CartResponse>(ENDPOINTS.CART.BASIC);
        console.log('[CartService] Cart fetched successfully:', response.cart);
        return response.cart;
    } catch (error) {
        console.error('[CartService] Error fetching cart:', error);
        throw error;
    }
}

export async function removeFromCart(itemId: number): Promise<void> {
    console.log(`[CartService] Removing item ${itemId} from cart`);
    try {
        await requestDelete<DeleteResponse>(`${ENDPOINTS.CART.REMOVE_ITEM}/${itemId}`);
        console.log('[CartService] Item removed successfully');
    } catch (error) {
        console.error('[CartService] Error removing item from cart:', error);
        throw error;
    }
}

// create checkout
export async function createCheckout(cartId: number): Promise<CheckoutDraftResponse> {
    console.log('[CheckoutService] Creating checkout for cart:', cartId);
    try {
        const response = await requestPostWithAuthFullResponse<CheckoutDraftResponse>(
            ENDPOINTS.CHECKOUT.CREATE,
            { cartId }
        );
        console.log('[CheckoutService] Checkout response:', response);
        return response;
    } catch (error) {
        console.error('[CheckoutService] Error creating checkout:', error);
        throw error;
    }
}