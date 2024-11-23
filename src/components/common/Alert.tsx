// components/Alert.tsx
import React from 'react';

interface AlertProps {
    type?: 'error' | 'success' | 'warning' | 'info';
    children: React.ReactNode;
    className?: string;
}

const getAlertStyles = (type: AlertProps['type']) => {
    switch (type) {
        case 'error':
            return 'bg-red-100 text-red-700 border-red-300';
        case 'success':
            return 'bg-green-100 text-green-700 border-green-300';
        case 'warning':
            return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'info':
            return 'bg-blue-100 text-blue-700 border-blue-300';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-300';
    }
};

export const Alert: React.FC<AlertProps> = ({
                                                type = 'info',
                                                children,
                                                className = ''
                                            }) => {
    const baseStyles = 'px-4 py-3 rounded-md border flex items-start space-x-2';
    const alertStyles = getAlertStyles(type);

    return (
        <div className={`${baseStyles} ${alertStyles} ${className}`}>
            {children}
        </div>
    );
};