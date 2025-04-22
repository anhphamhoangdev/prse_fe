import React, { useEffect, useState, useRef, memo } from 'react';
import { useInstructor } from '../../layouts/InstructorLayout';
import { useWebSocket } from '../../context/WebSocketContext';
import { useNotification } from '../../components/notification/NotificationProvider';
import { ChatMessageDTO } from '../../types/chat';
import { requestWithAuth } from '../../utils/request';
import { WebSocketMessage } from '../../types/websocket';
import { MessageCircle, Send, Menu, X } from 'lucide-react';
import {webSocketService} from "../../services/instructor/webSocketService";

interface Conversation {
    id: string;
    participantName: string;
    latestMessage: string;
    latestTimestamp: string;
    unreadCount: number;
    avatar?: string | null;
}

const ConversationCard = memo(
    ({
         conversation,
         isSelected,
         onSelect,
     }: {
        conversation: Conversation;
        isSelected: boolean;
        onSelect: () => void;
    }) => (
        <div
            onClick={onSelect}
            className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50 ${
                isSelected ? 'bg-blue-50' : ''
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <img
                        src={conversation.avatar || '/images/default-avatar.png'}
                        alt={conversation.participantName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => (e.currentTarget.src = '/images/default-avatar.png')}
                    />
                    <div className="flex-1">
                        <p
                            className={`text-sm font-medium ${
                                conversation.unreadCount > 0 ? 'text-blue-600' : 'text-slate-900'
                            }`}
                        >
                            {conversation.participantName}
                        </p>
                        <p className="text-sm text-slate-500 truncate">{conversation.latestMessage}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400">
                        {new Date(conversation.latestTimestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'UTC',
                        })}
                    </p>
                    {conversation.unreadCount > 0 && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                            {conversation.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    ),
    (prevProps, nextProps) =>
        prevProps.conversation.id === nextProps.conversation.id &&
        prevProps.conversation.latestMessage === nextProps.conversation.latestMessage &&
        prevProps.conversation.latestTimestamp === nextProps.conversation.latestTimestamp &&
        prevProps.conversation.unreadCount === nextProps.conversation.unreadCount &&
        prevProps.conversation.avatar === nextProps.conversation.avatar &&
        prevProps.isSelected === nextProps.isSelected
);

const InstructorMessages: React.FC = () => {
    const { instructor } = useInstructor();
    const { sendMessage, subscribeToConversation, unsubscribeFromConversation, isConnected } = useWebSocket();
    const { showNotification } = useNotification();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [isConversationListOpen, setIsConversationListOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const firstLoadRef = useRef<boolean>(true);

    const parseTimestamp = (timestamp: string): string => {
        if (!timestamp) return new Date().toISOString();
        try {
            const parsed = new Date(timestamp.replace(' ', 'T') + 'Z');
            return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
        } catch (error) {
            console.warn('Invalid timestamp:', timestamp, error);
            return new Date().toISOString();
        }
    };

    useEffect(() => {
        if (selectedConversationId && isConnected()) {
            subscribeToConversation(selectedConversationId);
            return () => {
                unsubscribeFromConversation(selectedConversationId);
            };
        }
    }, [selectedConversationId, subscribeToConversation, unsubscribeFromConversation, isConnected]);

    const fetchConversations = async () => {
        if (!instructor?.id) {
            console.warn('No instructor ID available for fetching conversations');
            return;
        }
        setIsLoadingConversations(true);
        try {
            const response = await requestWithAuth<{
                conversations: {
                    id: number;
                    participantName: string;
                    avatarUrl?: string | null;
                    latestMessage: string;
                    latestTimestamp: string;
                }[];
            }>('/conversations/instructor');
            const fetchedConversations = response.conversations.map(conv => ({
                id: conv.id.toString(),
                participantName: conv.participantName,
                avatar: conv.avatarUrl,
                latestMessage: conv.latestMessage || '',
                latestTimestamp: parseTimestamp(conv.latestTimestamp),
                unreadCount: 0,
            }));

            fetchedConversations.sort((a, b) =>
                new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
            );

            setConversations(fetchedConversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            showNotification('error', 'Lỗi', 'Không thể tải danh sách cuộc trò chuyện.');
        } finally {
            setIsLoadingConversations(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [instructor?.id, showNotification]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversationId) return;
            setIsLoadingMessages(true);
            try {
                const response = await requestWithAuth<{ messages: ChatMessageDTO[] }>(
                    `/conversations/chat/${selectedConversationId}/messages`
                );
                setMessages(response.messages);
                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === selectedConversationId ? { ...conv, unreadCount: 0 } : conv
                    )
                );
                firstLoadRef.current = true;
            } catch (error) {
                console.error('Error fetching messages:', error);
                showNotification('error', 'Lỗi', 'Không thể tải tin nhắn.');
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedConversationId, showNotification]);

    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        if (messages.length === 0) return;

        if (isLoadingMessages || firstLoadRef.current) {
            scrollToBottom('auto');
            firstLoadRef.current = false;
            return;
        }

        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;

            if (isAtBottom) {
                scrollToBottom('smooth');
            }
        }
    }, [messages, isLoadingMessages]);

    useEffect(() => {
        const handleMessage = (wsMessage: WebSocketMessage) => {
            console.log('Received WebSocket message:', wsMessage);

            if (wsMessage.type === 'NEW_MESSAGE' && wsMessage.data) {
                const message = wsMessage.data as ChatMessageDTO & { avatarUrl?: string | null };
                const conversationId = message.conversationId.toString();

                if (message.senderId !== instructor?.id && conversationId !== selectedConversationId) {
                    showNotification(
                        'info',
                        'Tin nhắn mới',
                        `Bạn nhận được tin nhắn từ ${message.senderName} trong cuộc trò chuyện ${conversationId}`
                    );
                }

                if (conversationId === selectedConversationId) {
                    setMessages(prevMessages => {
                        const isDuplicate = prevMessages.some(m => m.id && message.id && m.id === message.id);
                        if (!isDuplicate) {
                            return [...prevMessages, message];
                        }
                        return prevMessages;
                    });
                }

                setConversations(prevConversations => {
                    const conversationIndex = prevConversations.findIndex(conv => conv.id === conversationId);
                    let updatedConversations = [...prevConversations];
                    const isSelfMessage = message.senderId === instructor?.id;
                    const latestMessage = isSelfMessage
                        ? message.content
                        : `${message.senderName}: ${message.content}`;

                    if (conversationIndex === -1) {
                        console.warn(`Conversation ${conversationId} not found. Adding temporary entry and syncing.`);
                        fetchConversations();
                        updatedConversations = [
                            {
                                id: conversationId,
                                participantName: message.senderName,
                                avatar: message.avatarUrl,
                                latestMessage,
                                latestTimestamp: parseTimestamp(message.timestamp),
                                unreadCount: conversationId === selectedConversationId ? 0 : 1,
                            },
                            ...prevConversations,
                        ];
                    } else {
                        const existingConversation = prevConversations[conversationIndex];
                        const updatedConversation = {
                            ...existingConversation,
                            avatar: message.avatarUrl || existingConversation.avatar,
                            latestMessage,
                            latestTimestamp: parseTimestamp(message.timestamp),
                            unreadCount:
                                conversationId === selectedConversationId
                                    ? existingConversation.unreadCount
                                    : existingConversation.unreadCount + 1,
                        };
                        updatedConversations.splice(conversationIndex, 1);
                        updatedConversations = [updatedConversation, ...updatedConversations];
                    }

                    return updatedConversations;
                });
            } else if (wsMessage.type === 'MESSAGE_UPDATE' && wsMessage.data) {
                const update = wsMessage.data as {
                    conversationId: number;
                    senderName: string;
                    avatarUrl?: string | null;
                    content: string;
                    timestamp: string;
                };
                const conversationId = update.conversationId.toString();

                if (update.senderName !== instructor?.fullName && conversationId !== selectedConversationId) {
                    showNotification(
                        'info',
                        'Tin nhắn mới',
                        `Bạn nhận được tin nhắn từ ${update.senderName} trong cuộc trò chuyện ${conversationId}`
                    );
                }

                setConversations(prevConversations => {
                    const conversationIndex = prevConversations.findIndex(conv => conv.id === conversationId);
                    let updatedConversations = [...prevConversations];
                    const isSelfMessage = update.senderName === instructor?.fullName;
                    const latestMessage = isSelfMessage
                        ? update.content
                        : `${update.senderName}: ${update.content}`;

                    if (conversationIndex === -1) {
                        console.warn(`Conversation ${conversationId} not found. Adding temporary entry and syncing.`);
                        fetchConversations();
                        updatedConversations = [
                            {
                                id: conversationId,
                                participantName: update.senderName,
                                avatar: update.avatarUrl,
                                latestMessage,
                                latestTimestamp: parseTimestamp(update.timestamp),
                                unreadCount: conversationId === selectedConversationId ? 0 : 1,
                            },
                            ...prevConversations,
                        ];
                    } else {
                        const existingConversation = prevConversations[conversationIndex];
                        const updatedConversation = {
                            ...existingConversation,
                            avatar: update.avatarUrl || existingConversation.avatar,
                            latestMessage,
                            latestTimestamp: parseTimestamp(update.timestamp),
                            unreadCount:
                                conversationId === selectedConversationId
                                    ? existingConversation.unreadCount
                                    : existingConversation.unreadCount + 1,
                        };
                        updatedConversations.splice(conversationIndex, 1);
                        updatedConversations = [updatedConversation, ...updatedConversations];
                    }

                    return updatedConversations;
                });
            }
        };

        webSocketService.addMessageHandler(handleMessage);
        return () => {
            webSocketService.removeMessageHandler(handleMessage);
        };
    }, [selectedConversationId, fetchConversations, instructor?.id, instructor?.fullName, showNotification]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversationId || !instructor || isSendingMessage) {
            console.warn('Cannot send message: ', {
                newMessage: newMessage.trim(),
                selectedConversationId,
                instructor,
                isSendingMessage,
            });
            return;
        }

        setIsSendingMessage(true);

        const chatMessage: ChatMessageDTO = {
            conversationId: parseInt(selectedConversationId),
            senderId: instructor.id,
            senderType: 'INSTRUCTOR',
            senderName: instructor.fullName,
            content: newMessage,
            timestamp: new Date().toISOString(),
        };

        try {
            console.log('Sending ChatMessageDTO:', chatMessage);
            sendMessage('/app/send-message', chatMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('error', 'Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isSendingMessage) {
            handleSendMessage();
        }
    };

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tin nhắn</h1>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="text-slate-600">Trò chuyện với học viên của bạn</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsConversationListOpen(!isConversationListOpen)}
                    className="md:hidden p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {isConversationListOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-180px)]">
                <div
                    className={`${
                        isConversationListOpen ? 'block' : 'hidden'
                    } md:block w-full md:w-80 lg:w-96 bg-white rounded-xl shadow-sm overflow-hidden`}
                >
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                            Danh sách cuộc trò chuyện
                        </h2>
                    </div>
                    <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
                        {isLoadingConversations ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-slate-500">
                                Chưa có cuộc trò chuyện nào.
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <ConversationCard
                                    key={conv.id}
                                    conversation={conv}
                                    isSelected={selectedConversationId === conv.id}
                                    onSelect={() => {
                                        setSelectedConversationId(conv.id);
                                        setIsConversationListOpen(false);
                                        firstLoadRef.current = true;
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
                    {selectedConversationId ? (
                        isLoadingMessages ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {conversations.find(conv => conv.id === selectedConversationId)?.participantName}
                                    </h2>
                                    <p className="text-sm text-slate-500">Học viên</p>
                                </div>

                                <div
                                    ref={chatContainerRef}
                                    className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4"
                                    style={{ scrollBehavior: 'smooth' }}
                                >
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full text-slate-500">
                                            Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isInstructor = msg.senderType === 'INSTRUCTOR';
                                            const conversation = conversations.find(conv => conv.id === selectedConversationId);
                                            const avatarUrl = conversation?.avatar;
                                            return (
                                                <div
                                                    key={msg.id || index}
                                                    className={`flex items-end gap-2 ${
                                                        isInstructor ? 'justify-end' : 'justify-start'
                                                    } mb-2 animate-fade-in`}
                                                >
                                                    {!isInstructor && (
                                                        <img
                                                            src={avatarUrl || '/images/default-avatar.png'}
                                                            alt={msg.senderName}
                                                            className="w-6 h-6 rounded-full object-cover"
                                                            onError={(e) => (e.currentTarget.src = '/images/default-avatar.png')}
                                                        />
                                                    )}
                                                    <div
                                                        className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
                                                            isInstructor
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white text-slate-900 border border-gray-200'
                                                        }`}
                                                    >
                                                        <p className="text-sm">{msg.content}</p>
                                                        <span className="text-xs opacity-75 mt-1 block">
                                                            {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false,
                                                                timeZone: 'UTC',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-6 border-t border-gray-200 bg-white">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Nhập tin nhắn..."
                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            disabled={isSendingMessage}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                            disabled={isSendingMessage || !newMessage.trim()}
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            Chọn một cuộc trò chuyện để bắt đầu.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorMessages;