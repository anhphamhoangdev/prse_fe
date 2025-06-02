import {requestPost, requestPostWithAuthFullResponse} from "../utils/request";
import {AIResponse} from "../types/chat";
import {ENDPOINTS} from "../constants/endpoint";

export async function sendMessageAI(video_url: string | undefined, message: string): Promise<AIResponse> {
    console.log('[ChatService] Sending message to AI:', message);

    try {
        const response = await fetch('https://chatassistant-production-3885.up.railway.app/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_url,
                message
            })
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

export async function sendMessageAIRecommendation(message: string): Promise<AIResponse> {
    console.log('[ChatService] sendMessageAIRecommendation:', message);

    const url = `${process.env.REACT_APP_CHATBOT}`;

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