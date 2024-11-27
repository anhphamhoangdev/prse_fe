import {Message, MessageType} from '../types/chat';
import {CHAT_MESSAGES} from "../constants/chatMessage";

export const createMessage = (
    content: string,
    sender: Message['sender'],
    type: Message['type'] = 'text',
    metadata?: Message['metadata']
): Message => ({
    id: Date.now(),
    content,
    sender,
    timestamp: new Date().toISOString(),
    type,
    metadata
});

export const MessageUtils = {
    createMessage,

    createInitialMessages(params?: { lessonTitle?: string }): Message[] {
        const content = params?.lessonTitle
            ? `Xin chào! Tôi có thể giúp bạn tìm hiểu về bài "${params.lessonTitle}"`
            : CHAT_MESSAGES.WELCOME;

        return [
            createMessage(content, 'ai', 'text')
        ];
    },

    createUserMessage(content: string, metadata?: Message['metadata']): Message {
        return createMessage(content, 'user', 'text', metadata);
    },

    createAIMessage(content: string, metadata?: Message['metadata']): Message {
        return createMessage(content, 'ai', 'text', metadata);
    },

    createErrorMessage(error?: string): Message {
        return createMessage(
            error || CHAT_MESSAGES.ERROR,
            'system',
            'system'
        );
    }
};