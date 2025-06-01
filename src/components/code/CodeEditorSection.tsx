import {CodeLessonData} from "../../types/code";
import {Check, Clock, Code, Copy, Maximize2, Minimize2, Play, RefreshCw, Terminal, X} from "lucide-react";
import Editor from "@monaco-editor/react";
import { OutputConsole } from "./OutputConsole";

interface CodeExecutionResult {
    success: boolean;
    output: string;
    error: string;
    executionTime: number;
    memoryUsed: number;
    status: string;
    isCorrect: boolean | null;
    actualOutput: string | null;
    expectedOutput: string | null;
    input?: string;
}

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
    lastSubmission: any;  // Added
    handleEditorDidMount: (editor: any, monaco: any) => void;
    outputResult: CodeExecutionResult | null;
    isSubmission: boolean;
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
          lastSubmission,  // Added
          handleEditorDidMount,
          outputResult,
          isSubmission
      }) => {

    // Xác định submission nào để hiển thị (lastSubmission ưu tiên hơn userSubmission)
    const displaySubmission = lastSubmission || userSubmission;

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
                {/* Last Submission Indicator */}
                {lastSubmission && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full shadow-sm ${
                                    lastSubmission.status === 'PASSED' ? 'bg-green-500' :
                                        lastSubmission.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                                <div className="flex items-center space-x-2">
                                    <Terminal className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Code từ lần nộp cuối
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(lastSubmission.submittedAt).toLocaleString('vi-VN')}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    lastSubmission.status === 'PASSED'
                                        ? 'bg-green-100 text-green-700'
                                        : lastSubmission.status === 'FAILED'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {lastSubmission.status === 'PASSED' ? '✅ Đã pass' :
                                        lastSubmission.status === 'FAILED' ? '❌ Chưa pass' : '⏳ Pending'}
                                </span>
                                {lastSubmission.score !== undefined && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        Điểm: {lastSubmission.score}/100
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={resetCode}
                                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                title="Reset về code ban đầu"
                            >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reset code</span>
                            </button>
                        </div>
                    </div>
                )}

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
                            {isRunning && !isSubmission ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            <span>{isRunning && !isSubmission ? 'Đang chạy...' : 'Chạy code'}</span>
                        </button>
                        <button
                            onClick={handleSubmitCode}
                            disabled={isRunning}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-400 disabled:to-emerald-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                        >
                            {isRunning && isSubmission ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            <span>{isRunning && isSubmission ? 'Đang nộp...' : 'Nộp bài'}</span>
                        </button>
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                            <span className="font-mono">Ctrl/Cmd + Enter</span> để chạy code
                        </div>
                    </div>
                </div>

                {/* Output Console - Updated to use new component */}
                <OutputConsole
                    result={outputResult}
                    isSubmission={isSubmission}
                    isRunning={isRunning}
                />
            </div>
        </div>
    );
};