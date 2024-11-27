// services/instructor/webSocketService.ts
import { Client, IMessage } from '@stomp/stompjs';
import { ENDPOINTS } from "../../constants/endpoint";
import SockJS from "sockjs-client";
import { WebSocketMessage } from "../../types/websocket";

class WebSocketService {
    private client: Client | null = null;
    private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
    private currentInstructorId: number | null = null;


    connect(instructorId: number) {

        this.currentInstructorId = instructorId;

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
            console.log('Connected to WebSocket');

            // Subscribe to multiple channels
            const subscriptions = [
                `/topic/instructor/${instructorId}/uploads`,
                `/topic/instructor/${instructorId}/notifications`,
                `/topic/instructor/${instructorId}/course-updates`
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
}

export const webSocketService = new WebSocketService();