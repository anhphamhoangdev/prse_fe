import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotification } from '../components/notification/NotificationProvider';
import { useInstructor } from '../layouts/InstructorLayout';
import { WebSocketMessage } from "../types/websocket";
import { webSocketService } from "../services/instructor/webSocketService";
import { ChatMessageDTO } from '../types/chat';
import { useLocation } from 'react-router-dom';

interface WebSocketContextType {
    connect: (id: number, role: 'instructor' | 'student') => void;
    disconnect: () => void;
    isConnected: () => boolean;
    subscribeToConversation: (conversationId: string) => void;
    unsubscribeFromConversation: (conversationId: string) => void;
    sendMessage: (destination: string, message: ChatMessageDTO) => void;
    setActiveConversationId: (conversationId: string | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    connect: () => {},
    disconnect: () => {},
    isConnected: () => false,
    subscribeToConversation: () => {},
    unsubscribeFromConversation: () => {},
    sendMessage: () => {},
    setActiveConversationId: () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useNotification();
    const { instructor } = useInstructor();
    const location = useLocation();
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (instructor?.id) {
            const handleWebSocketMessage = (message: WebSocketMessage) => {
                try {
                    // Suppress all notifications on /instructor/messages
                    if (location.pathname.includes('/instructor/messages')) {
                        console.log(`Skipping notification for ${message.type} on messages page`);
                        return;
                    }

                    if (message.type === 'MESSAGE_UPDATE') {
                        const update = message.data as { conversationId: number, senderName: string, content: string };
                        showNotification(
                            'info',
                            'Tin nhắn mới',
                            `Bạn nhận được tin nhắn từ ${update.senderName} trong cuộc trò chuyện ${update.conversationId}`
                        );
                    } else if (message.type === 'NOTIFICATION') {
                        showNotification(
                            message.status.toLowerCase() as 'success' | 'error' | 'info',
                            'Thông báo',
                            message.message
                        );
                    } else if (message.type === 'UPLOAD_PROGRESS') {
                        showNotification(
                            'success',
                            'Tiến độ tải lên',
                            `Đang tải lên: ${message.progress || 0}%`
                        );
                    } else if (message.type === 'UPLOAD_STARTED') {
                        showNotification(
                            'info',
                            message.message,
                            message.data
                        );
                    } else if (message.type === 'UPLOAD_COMPLETE') {
                        showNotification(
                            'success',
                            message.message,
                            message.data
                        );
                    } else if (message.type === 'UPLOAD_ERROR') {
                        showNotification(
                            'error',
                            'Lỗi tải lên',
                            message.message
                        );
                    } else {
                        console.log('Received message:', message);
                    }
                } catch (error) {
                    console.error('Error handling websocket message:', error);
                }
            };

            webSocketService.connect(instructor.id, 'instructor');
            webSocketService.addMessageHandler(handleWebSocketMessage);

            return () => {
                webSocketService.removeMessageHandler(handleWebSocketMessage);
                webSocketService.disconnect();
            };
        }
    }, [instructor?.id, showNotification, location.pathname]);

    return (
        <WebSocketContext.Provider value={{
            connect: webSocketService.connect.bind(webSocketService),
            disconnect: webSocketService.disconnect.bind(webSocketService),
            isConnected: webSocketService.isConnected.bind(webSocketService),
            subscribeToConversation: webSocketService.subscribeToConversation.bind(webSocketService),
            unsubscribeFromConversation: webSocketService.unsubscribeFromConversation.bind(webSocketService),
            sendMessage: webSocketService.sendMessage.bind(webSocketService),
            setActiveConversationId,
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);