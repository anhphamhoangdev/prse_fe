import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, XCircle, X } from "lucide-react";

interface Notification {
    id: string;
    type: 'success' | 'error';
    title: string;
    message: string;
}

interface NotificationContextType {
    showNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = (type: 'success' | 'error', title: string, message: string) => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, type, title, message }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
        }, 3000);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`
                            w-96 rounded-lg shadow-lg 
                            ${notification.type === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }
                            transform translate-x-0 opacity-100 
                            transition-all duration-300 ease-in-out
                            hover:translate-x-[-4px]
                        `}
                    >
                        <div className="p-4 flex items-start">
                            {notification.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}

                            <div className="ml-3 flex-1">
                                <h3 className={`text-sm font-medium ${
                                    notification.type === 'success'
                                        ? 'text-green-800'
                                        : 'text-red-800'
                                }`}>
                                    {notification.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    {notification.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};