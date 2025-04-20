import { useEffect, useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DOMPurify from 'dompurify';
import { Message } from '../../types/chat';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom theme based on oneDark to match AIChatDrawer
const customOneDark = {
    ...prism,
    'code[class*="language-"]': {
        ...prism['code[class*="language-"]'],
        background: 'transparent',
        whiteSpace: 'pre',
        wordBreak: 'normal',
        fontSize: '0.9em',
        margin: '0',
        padding: '0',
        fontFamily: 'JetBrains Mono'
    },
    'pre[class*="language-"]': {
        ...prism['pre[class*="language-"]'],
        background: 'transparent',
        margin: '0',
        padding: '0',
        overflow: 'auto',
    },
};


interface MessageContentProps {
    message: Message;
    isNew?: boolean;
    isAlreadyDisplayed?: boolean;
    onDisplayed?: () => void;
    onStopTyping?: () => void;
    setStopTypingRef?: (fn: () => void) => void;
}

export const MessageContent: React.FC<MessageContentProps> = ({
                                                                  message,
                                                                  isNew = false,
                                                                  isAlreadyDisplayed = false,
                                                                  onDisplayed,
                                                                  onStopTyping,
                                                                  setStopTypingRef,
                                                              }) => {
    const [copied, setCopied] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const shouldAnimate =
        isNew &&
        message.type !== 'code' &&
        message.sender === 'ai' &&
        !isAlreadyDisplayed;
    const [isTyping, setIsTyping] = useState(shouldAnimate);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(shouldAnimate);

    // Hàm dừng typing
    const stopTyping = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsTyping(false);
        isTypingRef.current = false;
        setDisplayedText(message.content);
        if (onDisplayed) onDisplayed();
        if (onStopTyping) onStopTyping();
    }, [message.content, onDisplayed, onStopTyping]);

    // Lưu hàm stopTyping vào stopTypingRef
    useEffect(() => {
        if (shouldAnimate && setStopTypingRef) {
            setStopTypingRef(stopTyping);
        }
        return () => {
            if (setStopTypingRef) {
                setStopTypingRef(() => {});
            }
        };
    }, [shouldAnimate, setStopTypingRef, stopTyping]);

    // Typing effect for non-code messages
    useEffect(() => {
        if (isTyping && isTypingRef.current && !intervalRef.current) {
            const text = message.content;
            let index = 0;

            intervalRef.current = setInterval(() => {
                index += 1;
                setDisplayedText(text.slice(0, index));

                if (index >= text.length) {
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    setIsTyping(false);
                    isTypingRef.current = false;
                    setDisplayedText(text);
                    if (onDisplayed) onDisplayed();
                    if (onStopTyping) onStopTyping();
                }
            }, 10);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        } else if (!isTyping) {
            setDisplayedText(message.content);
            if (shouldAnimate && !isTyping && onDisplayed) {
                onDisplayed();
            }
        }
    }, [message.content, isTyping, onDisplayed, shouldAnimate, onStopTyping]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const renderContent = () => {
        if (message.type === 'code') {
            const codeContent = message.content.trim();
            const languageMatch = codeContent.match(/^```(\w*)([\s\S]+?)```$/);
            const language = languageMatch?.[1] || 'text';
            let code = languageMatch
                ? languageMatch[2].trim().replace(/^\n+|\n+$/g, '')
                : codeContent.trim();
            code = code.replace(/^\s+/, '');

            return (
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-lg p-4 bg-gray-100 overflow-x-auto max-w-full"
                >
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-600">
                            {language.toUpperCase()}
                        </span>
                        <button
                            onClick={() => copyToClipboard(code)}
                            className="flex items-center gap-2 rounded-md bg-gray-300 px-3 py-1.5 text-sm text-gray-800 font-medium transition-colors hover:bg-gray-400"
                        >
                            <AnimatePresence mode="wait">
                                {copied ? (
                                    <motion.div
                                        key="copied"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-1"
                                    >
                                        <Check size={16} className="text-green-600" />
                                        Copied
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="copy"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-1"
                                    >
                                        <Copy size={16} />
                                        Copy
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                    <SyntaxHighlighter
                        language={language}
                        style={customOneDark as any}
                        PreTag="div"
                        customStyle={{
                            background: 'transparent',
                            padding: '0 1rem 1rem 1rem',
                            margin: '0',
                            overflowX: 'auto',
                            whiteSpace: 'pre',
                            wordBreak: 'normal',
                        }}
                        wrapLines={false}
                        showLineNumbers={false}
                    >
                        {code}
                    </SyntaxHighlighter>
                </motion.div>
            );
        }

        const components = {
            code: ({ node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');

                if (match) {
                    const codeText = String(children)
                        .replace(/\n$/, '')
                        .replace(/^\s+/, '');

                    return (
                        <div className="relative my-2 bg-gray-100 rounded-lg overflow-x-auto max-w-full">
                            <div className="mb-2 flex items-center justify-between px-4 pt-4">
                                <span className="text-sm font-mono text-gray-600">
                                    {match[1].toUpperCase()}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(codeText)}
                                    className="flex items-center gap-2 rounded-md bg-gray-300 px-3 py-1.5 text-sm text-gray-800 font-medium transition-colors hover:bg-gray-400"
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.div
                                                key="copied"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-1"
                                            >
                                                <Check size={16} className="text-green-600" />
                                                Copied
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="copy"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-1"
                                            >
                                                <Copy size={16} />
                                                Copy
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                            <SyntaxHighlighter
                                style={customOneDark as any}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                    padding: '0 1rem 1rem 1rem',
                                    margin: '0',
                                    background: 'transparent',
                                    overflowX: 'auto',
                                }}
                            >
                                {codeText}
                            </SyntaxHighlighter>
                        </div>
                    );
                }
                return (
                    <code
                        className="rounded bg-gray-200 px-1.5 py-0.5 text-sm text-gray-800"
                        {...props}
                    >
                        {children}
                    </code>
                );
            },
            a: ({ href, children }: any) => (
                <a
                    href={href}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {children}
                </a>
            ),
            blockquote: ({ children }: any) => (
                <blockquote className="pl-4 border-l-4 border-gray-300 italic text-gray-600">
                    {children}
                </blockquote>
            ),
            ul: ({ children }: any) => <ul className="list-disc pl-6">{children}</ul>,
            ol: ({ children }: any) => <ol className="list-decimal pl-6">{children}</ol>,
        };

        // Nếu đang typing, chỉ hiển thị văn bản tĩnh, không dùng motion
        if (isTyping) {
            return (
                <div className="prose prose-gray max-w-full overflow-wrap break-word">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>
                        {displayedText}
                    </ReactMarkdown>
                </div>
            );
        }

        // Nếu không typing, sử dụng motion.div cho hiệu ứng xuất hiện ban đầu
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="prose prose-gray max-w-full overflow-wrap break-word"
            >
                <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>
                    {message.content}
                </ReactMarkdown>
            </motion.div>
        );
    };

    return (
        <div className="relative max-w-full">
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {renderContent()}
            </div>
        </div>
    );
};