import { Client, IMessage } from '@stomp/stompjs';
import { ENDPOINTS } from '../../constants/endpoint';
import SockJS from 'sockjs-client';
import { WebSocketMessage } from '../../types/websocket';
import { ChatMessageDTO } from '../../types/chat';

class WebSocketService {
    private client: Client | null = null;
    private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
    private currentId: number | null = null;
    private currentRole: 'instructor' | 'student' | null = null;
    private conversationSubscriptions: Map<string, () => void> = new Map();
    private processedMessageIds: Set<string> = new Set();
    private connected: boolean = false;
    private retryCount: number = 0;
    private maxRetries: number = 5;

    async connect(id: number, role: 'instructor' | 'student'): Promise<void> {
        if (this.client?.active && this.connected) {
            console.log('WebSocket already connected');
            return;
        }

        this.currentId = id;
        this.currentRole = role;

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            console.warn('No JWT token found in localStorage or sessionStorage');
        } else {
            console.log('Using JWT token:', token);
        }

        const socket = new SockJS(ENDPOINTS.WEBSOCKET.CONNECT);
        this.client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            debug: (str) => console.log('STOMP: ' + str),
            reconnectDelay: 10000, // Tăng thời gian reconnect
            heartbeatIncoming: 0, // Tắt heart-beat do server trả về 0,0
            heartbeatOutgoing: 0,
        });

        this.client.onConnect = () => {
            this.connected = true;
            this.retryCount = 0; // Reset retry count
            console.log(`Connected to WebSocket as ${role}`);

            // Subscribe to role-specific topics
            const notificationTopic = `/topic/${role}/${id}/notifications`;
            this.client?.subscribe(notificationTopic, (message: IMessage) => {
                this.handleMessage(message);
            });

            const messageUpdateTopic = `/topic/${role}/${id}/messages`;
            this.client?.subscribe(messageUpdateTopic, (message: IMessage) => {
                this.handleMessage(message);
            });

            const subscriptions = role === 'instructor' ? [
                `/topic/instructor/${id}/uploads`,
                `/topic/instructor/${id}/course-updates`
            ] : [
                `/topic/student/${id}/course-progress`,
                `/topic/student/${id}/purchases`
            ];

            subscriptions.forEach(destination => {
                this.client?.subscribe(destination, (message: IMessage) => {
                    this.handleMessage(message);
                });
            });
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            this.connected = false;
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying connection (${this.retryCount}/${this.maxRetries})...`);
            } else {
                console.error('Max retries reached. Giving up.');
                // Thông báo lỗi cho người dùng (được xử lý trong StudentWebSocketContext)
            }
        };

        this.client.onWebSocketError = (error) => {
            console.error('WebSocket error:', error);
            this.connected = false;
        };

        this.client.onWebSocketClose = () => {
            console.log('WebSocket closed');
            this.connected = false;
        };

        await this.client.activate();
    }

    private handleMessage(message: IMessage) {
        try {
            const parsedMessage: WebSocketMessage = JSON.parse(message.body);
            if (parsedMessage.type === 'NEW_MESSAGE' && parsedMessage.data?.id && this.processedMessageIds.has(parsedMessage.data.id)) {
                console.log(`Skipping duplicate NEW_MESSAGE ID: ${parsedMessage.data.id}`);
                return;
            }
            if (parsedMessage.type === 'NEW_MESSAGE' && parsedMessage.data?.id) {
                this.processedMessageIds.add(parsedMessage.data.id);
                if (this.processedMessageIds.size > 1000) {
                    this.processedMessageIds.clear();
                }
            }
            this.messageHandlers.forEach(handler => handler(parsedMessage));
        } catch (error) {
            console.error('Error parsing websocket message:', error);
        }
    }

    subscribeToConversation(conversationId: string) {
        if (!this.client?.active || !this.connected) {
            console.warn('WebSocket is not connected');
            return;
        }

        const destination = `/topic/conversation/${conversationId}`;
        if (this.conversationSubscriptions.has(destination)) {
            console.log(`Already subscribed to ${destination}`);
            return;
        }

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            this.handleMessage(message);
        });

        this.conversationSubscriptions.set(destination, subscription.unsubscribe);
        console.log(`Subscribed to ${destination}`);
    }

    unsubscribeFromConversation(conversationId: string) {
        const destination = `/topic/conversation/${conversationId}`;
        const unsubscribe = this.conversationSubscriptions.get(destination);
        if (unsubscribe) {
            unsubscribe();
            this.conversationSubscriptions.delete(destination);
            console.log(`Unsubscribed from ${destination}`);
        }
    }

    sendMessage(destination: string, message: ChatMessageDTO | WebSocketMessage) {
        if (!this.client?.active || !this.connected) {
            console.warn('WebSocket is not connected');
            throw new Error('WebSocket is not connected');
        }

        console.log(`Sending to ${destination}:`, message);
        this.client.publish({
            destination,
            body: JSON.stringify(message),
        });
    }

    disconnect() {
        if (this.client?.active) {
            this.conversationSubscriptions.forEach((unsubscribe, destination) => {
                unsubscribe();
                console.log(`Unsubscribed from ${destination}`);
            });
            this.conversationSubscriptions.clear();
            this.processedMessageIds.clear();
            this.client.deactivate();
            this.client = null;
            this.messageHandlers = [];
            this.currentId = null;
            this.currentRole = null;
            this.connected = false;
            this.retryCount = 0;
        }
    }

    addMessageHandler(handler: (message: WebSocketMessage) => void) {
        this.messageHandlers.push(handler);
    }

    removeMessageHandler(handler: (message: WebSocketMessage) => void) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    isConnected(): boolean {
        return <boolean>this.client?.active && this.connected;
    }

    getCurrentRole(): 'instructor' | 'student' | null {
        return this.currentRole;
    }
}

export const webSocketService = new WebSocketService();