import { useEffect, useRef, useState } from 'react';
import { Message } from 'postcss';
import { CodeBlock } from './CodeBlock';

export const MessageContent: React.FC<{ message: Message }> = ({ message }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isLongContent, setIsLongContent] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            const actualHeight = contentRef.current.scrollHeight;
            setIsLongContent(actualHeight > 300);
        }
    }, [message.content]);

    // Split the content into regular text and code blocks
    const splitContent = message.content.split(/```(?:\w+)?\n/);
    const contentParts = splitContent.map((part: string, index: number) => {
        if (index % 2 === 0) {
            // Regular text
            return <div key={index}>{part}</div>;
        } else {
            // Code block
            const languageMatch = part.match(/^(\w+)/);
            const language = languageMatch ? languageMatch[1] : undefined;
            const code = part.replace(/^\w+\n/, '').replace(/\n$/, '');
            return <CodeBlock key={index} content={code} language={language} />;
        }
    });

    return (
        <div className="relative" ref={contentRef}>
            <div className={`${!isExpanded && isLongContent ? 'max-h-[300px]' : ''} overflow-y-auto`}>
                <div className="whitespace-pre-wrap">{contentParts}</div>
            </div>

            {isLongContent && !isExpanded && (
                <>
                    <div className="absolute bottom-0 left-0 right-0 h-20  pointer-events-none" />
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                        Xem thêm
                    </button>
                </>
            )}

            {isLongContent && isExpanded && (
                <button
                    onClick={() => setIsExpanded(false)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                    Thu gọn
                </button>
            )}
        </div>
    );
};