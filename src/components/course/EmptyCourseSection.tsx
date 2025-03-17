import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyCourseSectionProps {
    message: string;
    subMessage?: string;
    actionText?: string;
    onAction?: () => void;
}

export const EmptyCourseSection: React.FC<EmptyCourseSectionProps> = ({
                                                                          message,
                                                                          subMessage,
                                                                          actionText,
                                                                          onAction
                                                                      }) => {
    return (
        <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <BookOpen size={40} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{message}</h3>
            {subMessage && <p className="text-gray-600 mb-6 text-center max-w-md">{subMessage}</p>}
            {/*{actionText && onAction && (*/}
            {/*    <button*/}
            {/*        onClick={onAction}*/}
            {/*        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"*/}
            {/*    >*/}
            {/*        {actionText}*/}
            {/*    </button>*/}
            {/*)}*/}
        </div>
    );
};