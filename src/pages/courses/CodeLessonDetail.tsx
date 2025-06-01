import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import {requestPostWithAuth, requestWithAuth} from '../../utils/request';
import {
    Code,
    Terminal,
    Settings,
    Star,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';
import { Lesson } from '../../types/course';

// Import components


// Import types
import LoadingScreen from "../../components/code/LoadingScreen";
import EmptyState from '../../components/code/EmptyState';
import LessonHeader from "../../components/code/LessonHeader";
import {CodeLessonApiResponse, CodeLessonData, UserSubmission} from "../../types/code";
import {ProblemStatement} from "../../components/code/ProblemStatement";
import {TestCases} from "../../components/code/TestCases";
import {CodeEditorSection} from "../../components/code/CodeEditorSection";
import HintsSection from "../../components/code/HintsSection";
import SolutionSection from "../../components/code/SolutionSection";

interface OutletContext {
    currentLesson: Lesson | null;
    handleLessonNavigation: (lesson: Lesson, chapterId: number) => void;
}

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
}

interface CodeExecutionResponse {
    result: CodeExecutionResult;
}

const CodeLessonDetail: React.FC = () => {
    const { courseId, chapterId, lessonId } = useParams<{ courseId: string; chapterId: string; lessonId: string }>();
    const { currentLesson: lessonInfo } = useOutletContext<OutletContext>();

    // States
    const [currentLesson, setCurrentLesson] = useState<CodeLessonData | null>(null);
    const [userSubmission, setUserSubmission] = useState<UserSubmission | null>(null);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [isLessonLoading, setIsLessonLoading] = useState(false);
    const [userCode, setUserCode] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [output, setOutput] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [outputData, setOutputData] = useState<any>(null);


    const fetchLessonData = useCallback(
        async (courseId: string, chapterId: string, lessonId: string) => {
            try {
                setIsLessonLoading(true);
                setCurrentLesson(null);
                setUserSubmission(null);
                setIsCompleted(false);

                const endpoint = `/course/${courseId}/${chapterId}/${lessonId}/code`;
                const responseData = await requestWithAuth<CodeLessonApiResponse>(endpoint);

                if (responseData.currentLesson) {
                    setCurrentLesson(responseData.currentLesson);
                    setIsCompleted(responseData.isCompleted);
                    setUserCode(responseData.currentLesson.initialCode || '');

                    if (responseData.userSubmission) {
                        setUserSubmission(responseData.userSubmission);
                        setUserCode(responseData.userSubmission.submittedCode);
                    }
                }
            } catch (error) {
                console.error('Error fetching lesson data:', error);
            } finally {
                setIsLessonLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        if (courseId && chapterId && lessonId) {
            fetchLessonData(courseId, chapterId, lessonId);
        }
    }, [courseId, chapterId, lessonId, fetchLessonData]);

    const getLanguageIcon = (language: string) => {
        switch (language.toLowerCase()) {
            case 'python': return Terminal;
            case 'cpp': return Settings;
            case 'java': return Code;
            default: return Code;
        }
    };

    const getLanguageConfig = (language: string) => {
        switch (language.toLowerCase()) {
            case 'python':
                return {
                    color: 'bg-gradient-to-r from-blue-600 to-yellow-500',
                    textColor: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    extension: 'py',
                    monaco: 'python'
                };
            case 'cpp':
                return {
                    color: 'bg-gradient-to-r from-blue-700 to-purple-600',
                    textColor: 'text-blue-700',
                    bgColor: 'bg-blue-50',
                    extension: 'cpp',
                    monaco: 'cpp'
                };
            case 'java':
                return {
                    color: 'bg-gradient-to-r from-red-600 to-orange-500',
                    textColor: 'text-red-600',
                    bgColor: 'bg-red-50',
                    extension: 'java',
                    monaco: 'java'
                };
            default:
                return {
                    color: 'bg-gradient-to-r from-gray-600 to-gray-800',
                    textColor: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    extension: 'txt',
                    monaco: 'plaintext'
                };
        }
    };

    const getDifficultyConfig = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return {
                    icon: Star,
                    color: 'text-green-600 bg-green-100 border-green-200',
                    name: 'Dễ'
                };
            case 'medium':
                return {
                    icon: TrendingUp,
                    color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
                    name: 'Trung bình'
                };
            case 'hard':
                return {
                    icon: AlertTriangle,
                    color: 'text-red-600 bg-red-100 border-red-200',
                    name: 'Khó'
                };
            default:
                return {
                    icon: Star,
                    color: 'text-gray-600 bg-gray-100 border-gray-200',
                    name: difficulty
                };
        }
    };

    const handleEditorDidMount = (editor: any, monaco: any) => {
        setIsEditorReady(true);

        // Configure Monaco editor theme
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

        editor.updateOptions({
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
            renderLineHighlight: 'gutter',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            padding: { top: 16, bottom: 16 }
        });

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            console.log('Save shortcut pressed');
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            handleRunCode();
        });
    };

    const handleRunCode = async () => {
        if (!currentLesson || !userCode.trim()) {
            setOutput('❌ Lỗi: Code không được để trống');
            setIsSuccess(false);
            return;
        }

        setIsRunning(true);
        setIsSuccess(null);

        // Hiển thị loading state
        setOutput(`🔄 Đang thực thi code ${currentLesson.language}...
⏳ Vui lòng chờ trong giây lát...`);

        try {
            const requestData = {
                code: userCode,
                language: currentLesson.language.toLowerCase(),
                input: currentLesson.testCaseInput || "",
                expectedOutput: currentLesson.testCaseOutput || null
            };

            console.log('🚀 Sending execution request:', {
                language: requestData.language,
                codeLength: requestData.code.length,
                hasInput: !!requestData.input,
                hasExpectedOutput: !!requestData.expectedOutput
            });

            const startTime = Date.now();

            // Gọi API
            const responseData = await requestPostWithAuth<CodeExecutionResponse>(
                '/code/execute',
                requestData
            );

            const networkTime = Date.now() - startTime;
            console.log(`✅ Response received in ${networkTime}ms:`, responseData);

            const result = responseData.result;

            // Format output dựa trên kết quả
            let outputText = '';

            if (result.success) {
                // Success case
                outputText = `=== ✅ Code Execution Successful ===
Language: ${currentLesson.language.toUpperCase()}
Status: ${result.status}

📥 Input:
${requestData.input || '(no input)'}

📤 Output:
${result.output || '(no output)'}`;

                // Thêm expected output nếu có
                if (result.expectedOutput) {
                    outputText += `\n\n🎯 Expected Output:
${result.expectedOutput}`;
                }

                // Performance metrics
                outputText += `\n\n⚡ Performance:
Execution time: ${result.executionTime}ms
Network time: ${networkTime}ms`;

                if (result.memoryUsed && result.memoryUsed > 0) {
                    outputText += `\nMemory used: ${result.memoryUsed}KB`;
                }

                // Correctness check
                if (result.isCorrect !== null) {
                    if (result.isCorrect) {
                        outputText += `\n\n🎉 Result: CORRECT ✅`;
                    } else {
                        outputText += `\n\n❌ Result: INCORRECT`;

                        if (result.actualOutput && result.expectedOutput) {
                            outputText += `\n\n🔍 Comparison:
Your output:     "${result.actualOutput}"
Expected output: "${result.expectedOutput}"`;
                        }
                    }
                }

            } else {
                // Error case
                outputText = `=== ❌ Code Execution Failed ===
Language: ${currentLesson.language.toUpperCase()}
Status: ${result.status}

🚨 Error Details:
${result.error || 'Unknown error occurred'}`;

                if (result.executionTime) {
                    outputText += `\n\n⏱️ Failed after: ${result.executionTime}ms`;
                }

                // Hiển thị partial output nếu có
                if (result.output && result.output.trim()) {
                    outputText += `\n\n📝 Partial Output (before error):
${result.output}`;
                }

                // Gợi ý debug
                outputText += `\n\n💡 Debug Tips:
• Check your syntax
• Verify input/output format
• Look for runtime errors`;
            }

            setOutput(outputText);
            setIsSuccess(result.success);

        } catch (error) {
            console.error('❌ Code execution failed:', error);

            let errorMessage = 'Unknown error occurred';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            setOutput(`=== ❌ Network/API Error ===
Failed to execute code: ${errorMessage}

💡 Possible causes:
• Network connection issues
• Server temporarily unavailable
• Invalid request format

🔧 Try again or contact support if the problem persists.`);
            setIsSuccess(false);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        console.log('Submitting code:', userCode);
    };

    const resetCode = () => {
        setUserCode(currentLesson?.initialCode || '');
        setOutput('');
        setIsSuccess(null);
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(userCode);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // Loading state
    if (isLessonLoading) {
        return <LoadingScreen />;
    }

    // Empty state
    if (!currentLesson) {
        return <EmptyState />;
    }

    const difficulty = getDifficultyConfig(currentLesson.difficultyLevel);
    const languageConfig = getLanguageConfig(currentLesson.language);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <LessonHeader
                lessonInfo={lessonInfo}
                currentLesson={currentLesson}
                isCompleted={isCompleted}
                languageConfig={languageConfig}
                difficulty={difficulty}
                getLanguageIcon={getLanguageIcon}
            />

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <ProblemStatement currentLesson={currentLesson} />

                <TestCases currentLesson={currentLesson} />

                <CodeEditorSection
                    currentLesson={currentLesson}
                    userCode={userCode}
                    setUserCode={setUserCode}
                    languageConfig={languageConfig}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    handleRunCode={handleRunCode}
                    handleSubmitCode={handleSubmitCode}
                    resetCode={resetCode}
                    copyCode={copyCode}
                    isRunning={isRunning}
                    userSubmission={userSubmission}
                    handleEditorDidMount={handleEditorDidMount}
                    output={output}
                    isSuccess={isSuccess}
                />

                <div className="space-y-6">
                    <HintsSection
                        hints={currentLesson.hints}
                        showHints={showHints}
                        setShowHints={setShowHints}
                    />

                    <SolutionSection
                        solutionCode={currentLesson.solutionCode}
                        showSolution={showSolution}
                        setShowSolution={setShowSolution}
                        languageConfig={languageConfig}
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeLessonDetail;