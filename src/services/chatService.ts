import {requestPost, requestPostWithAuthFullResponse} from "../utils/request";
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

export async function sendMessageAIRecommendation(message: string): Promise<AIResponse> {
    console.log('[ChatService] sendMessageAIRecommendation:', message);

    const url = 'https://prse-api.ngrok.app/rec_chatbot';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AIResponse = await response.json();
        console.log('[ChatService] AI response:', data);
        return data;

    } catch (error) {
        console.error('[ChatService] Error sending message to AI:', error);
        throw error;
    }
}