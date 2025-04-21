import { Client, IMessage } from '@stomp/stompjs';
import { ENDPOINTS } from "../../constants/endpoint";
import SockJS from "sockjs-client";
import { WebSocketMessage } from "../../types/websocket";

class WebSocketService {
    private client: Client | null = null;
    private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
    private currentId: number | null = null;
    private currentRole: 'instructor' | 'student' | null = null;

    connect(id: number, role: 'instructor' | 'student') {
        this.currentId = id;
        this.currentRole = role;

        if (this.client?.active) {
            console.log('WebSocket already connected');
            return;
        }

        const socket = new SockJS(ENDPOINTS.WEBSOCKET.CONNECT);
        this.client = new Client({
            webSocketFactory: () => socket,
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            console.log(`Connected to WebSocket as ${role}`);

            // Define subscriptions based on role
            const subscriptions = role === 'instructor' ? [
                `/topic/instructor/${id}/uploads`,
                `/topic/instructor/${id}/notifications`,
                `/topic/instructor/${id}/course-updates`
            ] : [
                `/topic/student/${id}/notifications`,
                `/topic/student/${id}/course-progress`,
                `/topic/student/${id}/purchases`
            ];

            subscriptions.forEach(destination => {
                this.client?.subscribe(destination, (message: IMessage) => {
                    try {
                        const parsedMessage: WebSocketMessage = JSON.parse(message.body);
                        this.messageHandlers.forEach(handler => handler(parsedMessage));
                    } catch (error) {
                        console.error('Error parsing websocket message:', error);
                    }
                });
            });
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client?.active) {
            this.client.deactivate();
            this.client = null;
            this.messageHandlers = [];
            this.currentId = null;
            this.currentRole = null;
        }
    }

    addMessageHandler(handler: (message: WebSocketMessage) => void) {
        this.messageHandlers.push(handler);
    }

    removeMessageHandler(handler: (message: WebSocketMessage) => void) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    isConnected(): boolean {
        return this.client?.active ?? false;
    }

    getCurrentRole(): 'instructor' | 'student' | null {
        return this.currentRole;
    }
}

export const webSocketService = new WebSocketService();