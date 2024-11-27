import React, { useState, useRef } from 'react';
import { Copy, Check, ChevronUp, ChevronDown } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    content: string;
    language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ content, language }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const codeRef = useRef<HTMLPreElement>(null);

    // Format code by removing extra whitespace and indenting properly
    const formatCode = (code: string): string => {
        // Remove empty lines at start and end
        const lines = code.split('\n').filter(line => line.trim() !== '');

        // Find minimum indentation
        const minIndent = lines
            .filter(line => line.trim().length > 0)
            .reduce((min, line) => {
                const indent = line.match(/^\s*/)?.[0].length || 0;
                return Math.min(min, indent);
            }, Infinity);

        // Remove minimum indentation from all lines
        const formattedLines = lines.map(line =>
            line.slice(Math.min(minIndent, line.match(/^\s*/)?.[0].length || 0))
        );

        return formattedLines.join('\n');
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const isLongCode = content.split('\n').length > 10;
    const formattedContent = formatCode(content);

    return (
        <div className="relative group font-mono text-sm bg-[#1E1E1E] rounded-lg overflow-hidden">
            {/* Header với language badge và actions */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-gray-300 text-xs border-b border-[#404040]">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-[#404040] text-gray-200 font-medium">
                        {language || 'code'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isLongCode && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-[#404040] rounded transition-colors"
                            aria-label={isExpanded ? 'Show less' : 'Show more'}
                        >
                            {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        </button>
                    )}
                    <button
                        onClick={copyToClipboard}
                        className="p-1 hover:bg-[#404040] rounded transition-colors flex items-center gap-1"
                        aria-label="Copy code"
                    >
                        {isCopied ? (
                            <>
                                <Check size={14} className="text-green-400"/>
                                <span className="text-green-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={14}/>
                                <span className="hidden group-hover:inline">Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Code content với line numbers */}
            <div className={`relative ${!isExpanded && isLongCode ? 'max-h-[250px]' : ''} overflow-hidden`}>
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#2D2D2D] border-r border-[#404040]"/>
                <SyntaxHighlighter
                    language={language || 'typescript'}
                    style={vscDarkPlus}
                    showLineNumbers
                    customStyle={{
                        margin: 0,
                        background: 'transparent',
                        padding: '1rem 0',
                    }}
                    lineNumberStyle={{
                        minWidth: '2.5rem',
                        paddingRight: '1rem',
                        textAlign: 'right',
                        color: '#6B7280',
                        userSelect: 'none',
                    }}
                    wrapLines={true}
                    lineProps={{
                        style: {
                            display: 'block',
                            paddingLeft: '3rem',
                            paddingRight: '1rem',
                        }
                    }}
                >
                    {formattedContent}
                </SyntaxHighlighter>
            </div>

            {/* Gradient fade for long code */}
            {!isExpanded && isLongCode && (
                <div
                    className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1E1E1E] to-transparent pointer-events-none"/>
            )}
        </div>
    );
};