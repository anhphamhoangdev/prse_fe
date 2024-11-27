// context/WebSocketContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useNotification } from '../components/notification/NotificationProvider';
import { useInstructor } from '../layouts/InstructorLayout';
import { webSocketService } from "../services/instructor/webSocketService";
import { WebSocketMessage } from "../types/websocket";

interface WebSocketContextType {
    connect: (instructorId: number) => void;
    disconnect: () => void;
    isConnected: () => boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
    connect: () => {},
    disconnect: () => {},
    isConnected: () => false
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useNotification();
    const { instructor } = useInstructor();

    useEffect(() => {
        if (instructor?.id) {
            const handleWebSocketMessage = (message: WebSocketMessage) => {
                try {
                    switch (message.type) {
                        case 'NOTIFICATION':
                            showNotification(
                                message.status.toLowerCase() as 'success' | 'error',
                                'Thông báo',
                                message.message
                            );
                            break;

                        case 'UPLOAD_PROGRESS':
                            showNotification(
                                'success',
                                'Tiến độ tải lên',
                                `Đang tải lên: ${message.progress || 0}%`
                            );
                            break;

                        case 'UPLOAD_COMPLETE':
                            showNotification(
                                'success',
                                'Hoàn thành',
                                'Tải lên thành công!'
                            );
                            break;

                        case 'UPLOAD_ERROR':
                            showNotification(
                                'error',
                                'Lỗi tải lên',
                                message.message
                            );
                            break;

                        default:
                            console.log('Received message:', message);
                            break;
                    }
                } catch (error) {
                    console.error('Error handling websocket message:', error);
                }
            };

            // Connect to WebSocket
            webSocketService.connect(instructor.id);
            webSocketService.addMessageHandler(handleWebSocketMessage);

            // Cleanup on unmount
            return () => {
                webSocketService.removeMessageHandler(handleWebSocketMessage);
                webSocketService.disconnect();
            };
        }
    }, [instructor?.id, showNotification]);

    return (
        <WebSocketContext.Provider value={{
            connect: webSocketService.connect.bind(webSocketService),
            disconnect: webSocketService.disconnect.bind(webSocketService),
            isConnected: webSocketService.isConnected.bind(webSocketService)
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);