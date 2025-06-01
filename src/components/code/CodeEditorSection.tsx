// Thêm component này vào file của bạn, trước component CodeLessonDetail
import {CodeLessonData} from "../../types/code";
import {Check, Clock, Code, Copy, Maximize2, Minimize2, Play, RefreshCw, Terminal, X} from "lucide-react";
import Editor from "@monaco-editor/react";

export const CodeEditorSection: React.FC<{
    currentLesson: CodeLessonData;
    userCode: string;
    setUserCode: (code: string) => void;
    languageConfig: any;
    isFullscreen: boolean;
    setIsFullscreen: (fullscreen: boolean) => void;
    handleRunCode: () => void;
    handleSubmitCode: () => void;
    resetCode: () => void;
    copyCode: () => void;
    isRunning: boolean;
    userSubmission: any;
    handleEditorDidMount: (editor: any, monaco: any) => void;
    output: string;
    isSuccess: boolean | null;
}> = ({
          currentLesson,
          userCode,
          setUserCode,
          languageConfig,
          isFullscreen,
          setIsFullscreen,
          handleRunCode,
          handleSubmitCode,
          resetCode,
          copyCode,
          isRunning,
          userSubmission,
          handleEditorDidMount,
          output,
          isSuccess
      }) => {
    return (
        <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg ${languageConfig.color} flex items-center justify-center shadow-sm`}>
                            <Code className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Code Editor</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${languageConfig.bgColor} ${languageConfig.textColor} border`}>
                            {currentLesson.language.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={copyCode}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Copy code"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={resetCode}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm font-medium">Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor */}
            <div className="p-6">
                <div className="bg-gray-900 rounded-lg overflow-hidden shadow-inner border border-gray-700">
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                        </div>
                        <div className="text-xs text-gray-400 font-mono bg-gray-700 px-2 py-1 rounded">
                            main.{languageConfig.extension}
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className={`${isFullscreen ? 'h-96' : 'h-80'} relative`}>
                        <Editor
                            height="100%"
                            language={languageConfig.monaco}
                            value={userCode}
                            onChange={(value) => setUserCode(value || '')}
                            onMount={handleEditorDidMount}
                            loading={
                                <div className="flex items-center justify-center h-full">
                                    <div className="flex items-center space-x-3">
                                        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                                        <span className="text-gray-400">Loading editor...</span>
                                    </div>
                                </div>
                            }
                            options={{
                                selectOnLineNumbers: true,
                                roundedSelection: false,
                                readOnly: false,
                                cursorStyle: 'line',
                                automaticLayout: true,
                                glyphMargin: false,
                                folding: true,
                                lineNumbers: 'on',
                                lineDecorationsWidth: 10,
                                lineNumbersMinChars: 3,
                                scrollbar: {
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                        >
                            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            <span>{isRunning ? 'Đang chạy...' : 'Chạy code'}</span>
                        </button>
                        <button
                            onClick={handleSubmitCode}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            <Check className="w-4 h-4" />
                            <span>Nộp bài</span>
                        </button>
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                            <span className="font-mono">Ctrl/Cmd + Enter</span> để chạy code
                        </div>
                    </div>
                    {userSubmission && (
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm ${
                                userSubmission.isCorrect
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                                {userSubmission.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                <span>Lần nộp trước: {userSubmission.isCorrect ? 'Đúng' : 'Sai'}</span>
                            </div>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                                <Clock className="w-4 h-4 inline mr-2" />
                                {new Date(userSubmission.submittedAt).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Output Console */}
                {output && (
                    <div className="mt-6">
                        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <Terminal className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-300 font-semibold text-sm">Console Output</span>
                                </div>
                                {isSuccess !== null && (
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                        isSuccess
                                            ? 'bg-green-900 text-green-300 border border-green-700'
                                            : 'bg-red-900 text-red-300 border border-red-700'
                                    }`}>
                                        {isSuccess ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        <span>{isSuccess ? 'Thành công' : 'Lỗi'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <pre className="text-gray-200 font-mono text-sm leading-relaxed">{output}</pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};