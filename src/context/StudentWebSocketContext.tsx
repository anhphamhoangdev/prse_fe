import React, { createContext, useContext, useEffect } from 'react';
import { useNotification } from '../components/notification/NotificationProvider';
import { WebSocketMessage } from '../types/websocket';
import { ChatMessageDTO } from '../types/chat';
import { useUser } from './UserContext';
import { webSocketService } from '../services/instructor/webSocketService';

interface StudentWebSocketContextType {
    connect: (id: number, role: 'student') => void;
    disconnect: () => void;
    isConnected: () => boolean;
    subscribeToConversation: (conversationId: string) => void;
    unsubscribeFromConversation: (conversationId: string) => void;
    sendMessage: (destination: string, message: ChatMessageDTO | WebSocketMessage) => void;
}

const StudentWebSocketContext = createContext<StudentWebSocketContextType>({
    connect: () => {},
    disconnect: () => {},
    isConnected: () => false,
    subscribeToConversation: () => {},
    unsubscribeFromConversation: () => {},
    sendMessage: () => {},
});

export const StudentWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useNotification();
    const { user, isLoggedIn } = useUser();

    const handleStudentMessage = (message: WebSocketMessage) => {
        try {
            // Check if this is a message from the current user
            const isOwnMessage = message.data?.senderId && message.data.senderId === user?.id;

            switch (message.type) {
                case 'NOTIFICATION':
                    if (isOwnMessage) {
                        console.log('Skipping notification for self-sent message');
                        return;
                    }
                    showNotification(
                        message.status.toLowerCase() as 'success' | 'error' | 'info',
                        'Thông báo',
                        message.message
                    );
                    break;
                case 'NEW_MESSAGE':
                    // Skip notification for your own messages
                    if (isOwnMessage) {
                        console.log('Skipping notification for self-sent message');
                        return;
                    }
                    // showNotification(
                    //     'info',
                    //     'Tin nhắn mới',
                    //     `Bạn nhận được tin nhắn từ ${message.data.senderName} trong cuộc trò chuyện ${message.data.conversationId}`
                    // );
                    break;
                // Other cases...
            }
        } catch (error) {
            console.error('Error handling student websocket message:', error);
        }
    };

    useEffect(() => {
        if (
            isLoggedIn &&
            user &&
            user.id &&
            (!webSocketService.isConnected() || webSocketService.getCurrentRole() !== 'student')
        ) {
            console.log('Connecting WebSocket for student:', user.id);
            webSocketService.connect(user.id, 'student');
            webSocketService.addMessageHandler(handleStudentMessage);
            return () => {
                console.log('Disconnecting WebSocket for student');
                webSocketService.removeMessageHandler(handleStudentMessage);
                webSocketService.disconnect();
            };
        }
    }, [user, isLoggedIn]);

    return (
        <StudentWebSocketContext.Provider
            value={{
                connect: (id) => webSocketService.connect(id, 'student'),
                disconnect: webSocketService.disconnect.bind(webSocketService),
                isConnected: webSocketService.isConnected.bind(webSocketService),
                subscribeToConversation: webSocketService.subscribeToConversation.bind(webSocketService),
                unsubscribeFromConversation: webSocketService.unsubscribeFromConversation.bind(webSocketService),
                sendMessage: (destination, message) => webSocketService.sendMessage(destination, message),
            }}
        >
            {children}
        </StudentWebSocketContext.Provider>
    );
};

export const useStudentWebSocket = () => useContext(StudentWebSocketContext);