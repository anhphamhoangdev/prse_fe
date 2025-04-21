// context/StudentWebSocketContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useNotification } from '../components/notification/NotificationProvider';
import { WebSocketMessage } from '../types/websocket';
import {useUser} from "./UserContext";
import {webSocketService} from "../services/instructor/webSocketService";

interface StudentWebSocketContextType {
    connect: (id: number, role: 'student') => void;
    disconnect: () => void;
    isConnected: () => boolean;
}

const StudentWebSocketContext = createContext<StudentWebSocketContextType>({
    connect: () => {},
    disconnect: () => {},
    isConnected: () => false,
});

export const StudentWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showNotification } = useNotification();
    const { user, isLoggedIn } = useUser();

    const handleStudentMessage = (message: WebSocketMessage) => {
        try {
            switch (message.type) {
                case 'NOTIFICATION':
                    showNotification(
                        message.status.toLowerCase() as 'success' | 'error',
                        'Thông báo',
                        message.message
                    );
                    break;
                case 'COURSE_PROGRESS':
                    showNotification(
                        'success',
                        'Tiến độ khóa học',
                        `Bạn đã hoàn thành ${message.progress}% của khóa học ${message.data.courseName}`
                    );
                    break;
                case 'PURCHASE_SUCCESS':
                    showNotification(
                        'success',
                        'Mua khóa học',
                        `Bạn đã mua thành công khóa học ${message.data.courseName}`
                    );
                    break;
                default:
                    console.log('Student message:', message);
                    break;
            }
        } catch (error) {
            console.error('Error handling student websocket message:', error);
        }
    };

    useEffect(() => {
        console.log('StudentWebSocketProvider useEffect triggered', {
            isLoggedIn,
            user: user ? { id: user.id, instructor: user.instructor } : null,
            isConnected: webSocketService.isConnected(),
            currentRole: webSocketService.getCurrentRole(),
        });
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
    }, [user, isLoggedIn, showNotification]);

    return (
        <StudentWebSocketContext.Provider
            value={{
                connect: (id) => webSocketService.connect(id, 'student'),
                disconnect: webSocketService.disconnect.bind(webSocketService),
                isConnected: webSocketService.isConnected.bind(webSocketService),
            }}
        >
            {children}
        </StudentWebSocketContext.Provider>
    );
};

export const useStudentWebSocket = () => useContext(StudentWebSocketContext);