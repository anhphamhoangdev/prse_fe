import React from 'react';
import Editor from '@monaco-editor/react';
import { Award, ChevronDown } from 'lucide-react';

interface SolutionSectionProps {
    solutionCode: string;
    showSolution: boolean;
    setShowSolution: (show: boolean) => void;
    languageConfig: {
        color: string;
        textColor: string;
        bgColor: string;
        extension: string;
        monaco: string;
    };
}

const SolutionSection: React.FC<SolutionSectionProps> = ({
                                                             solutionCode,
                                                             showSolution,
                                                             setShowSolution,
                                                             languageConfig
                                                         }) => {
    if (!solutionCode) return null;

    const handleSolutionEditorMount = (editor: any, monaco: any) => {
        // Define custom theme if not already defined
        try {
            monaco.editor.defineTheme('custom-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6A9955' },
                    { token: 'keyword', foreground: '569CD6' },
                    { token: 'string', foreground: 'CE9178' },
                    { token: 'number', foreground: 'B5CEA8' },
                    { token: 'type', foreground: '4EC9B0' },
                    { token: 'function', foreground: 'DCDCAA' }
                ],
                colors: {
                    'editor.background': '#1F2937',
                    'editor.foreground': '#F3F4F6',
                    'editorLineNumber.foreground': '#6B7280',
                    'editorLineNumber.activeForeground': '#9CA3AF',
                    'editor.selectionBackground': '#374151',
                    'editor.inactiveSelectionBackground': '#374151',
                    'editorCursor.foreground': '#F3F4F6',
                    'scrollbarSlider.background': '#4B556380',
                    'scrollbarSlider.hoverBackground': '#4B55636B',
                    'scrollbarSlider.activeBackground': '#4B5563'
                }
            });
            monaco.editor.setTheme('custom-dark');
        } catch (e) {
            monaco.editor.setTheme('vs-dark');
        }

        editor.updateOptions({
            readOnly: true,
            fontSize: 14,
            fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
            fontLigatures: true,
            lineHeight: 1.6,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: false,
            renderLineHighlight: 'none',
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            contextmenu: false,
            selectOnLineNumbers: false,
            glyphMargin: false,
            folding: true,
            lineNumbers: 'on',
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
            },
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <button
                onClick={() => setShowSolution(!showSolution)}
                className="w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Award className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Lời giải mẫu</h2>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Solution
                        </span>
                    </div>
                    <div className={`transition-transform duration-200 ${showSolution ? 'transform rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                    </div>
                </div>
            </button>
            {showSolution && (
                <div className="px-6 pb-6 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="pt-4">
                        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="text-xs text-gray-400 font-mono bg-gray-700 px-2 py-1 rounded">
                                    solution.{languageConfig.extension}
                                </div>
                            </div>
                            <div className="h-80 relative">
                                <Editor
                                    height="100%"
                                    language={languageConfig.monaco}
                                    value={solutionCode}
                                    onMount={handleSolutionEditorMount}
                                    loading={
                                        <div className="flex items-center justify-center h-full">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-gray-400 text-sm">Loading solution...</span>
                                            </div>
                                        </div>
                                    }
                                    options={{
                                        readOnly: true,
                                        selectOnLineNumbers: false,
                                        roundedSelection: false,
                                        cursorStyle: 'line',
                                        automaticLayout: true,
                                        glyphMargin: false,
                                        folding: true,
                                        lineNumbers: 'on',
                                        lineDecorationsWidth: 10,
                                        lineNumbersMinChars: 3,
                                        contextmenu: false,
                                        scrollbar: {
                                            verticalScrollbarSize: 8,
                                            horizontalScrollbarSize: 8,
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolutionSection;