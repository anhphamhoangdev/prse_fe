import {requestPostWithAuthFullResponse} from "../utils/request";
import {AIResponse} from "../types/chat";
import {ENDPOINTS} from "../constants/endpoint";

export async function sendMessageAI(message: string): Promise<AIResponse> {
    console.log('[ChatService] Sending message to AI:', message);

    try {
        const response = await requestPostWithAuthFullResponse<AIResponse>(
            ENDPOINTS.CHAT.CHAT,
            { message }
        );
        console.log('[ChatService] AI response:', response);
        return response;

    } catch (error) {
        console.error('[ChatService] Error sending message to AI:', error);
        throw error;
    }
}