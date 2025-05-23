export interface Message {
    id: number;
    content: string;
    sender: 'user' | 'ai' | 'system';
    timestamp: string;
    type: 'text' | 'code' | 'system';
    metadata?: {
        lessonId?: number;
        lessonTitle?: string;
        chapterId?: number;
    };
}

export interface AIResponse {
    error_message: Record<string, unknown>;
    code: number;
    data: {
        message: string;
    };
}

export type MessageType = 'text' | 'code';

export interface ChatMessageDTO {
    id?: number; // ID do backend cung cấp
    conversationId: number;
    senderId: number;
    senderType: 'STUDENT' | 'INSTRUCTOR';
    senderName: string;
    content: string;
    timestamp: string;
}