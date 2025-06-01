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
import LoadingScreen from "../../components/code/LoadingScreen";
import EmptyState from '../../components/code/EmptyState';
import LessonHeader from "../../components/code/LessonHeader";
import {CodeLessonApiResponse, CodeLessonData, UserSubmission} from "../../types/code";
import {ProblemStatement} from "../../components/code/ProblemStatement";
import {TestCases} from "../../components/code/TestCases";
import {CodeEditorSection} from "../../components/code/CodeEditorSection";
import HintsSection from "../../components/code/HintsSection";
import SolutionSection from "../../components/code/SolutionSection";
import {useNotification} from "../../components/notification/NotificationProvider";

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
    input?: string;
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
    const [lastSubmission, setLastSubmission] = useState<UserSubmission | null>(null);
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
    const { showNotification } = useNotification();

    const [outputResult, setOutputResult] = useState<CodeExecutionResult | null>(null);
    const [isSubmission, setIsSubmission] = useState(false);

    const fetchLessonData = useCallback(
        async (courseId: string, chapterId: string, lessonId: string) => {
            try {
                setIsLessonLoading(true);
                setCurrentLesson(null);
                setUserSubmission(null);
                setLastSubmission(null); // Reset lastSubmission
                setIsCompleted(false);

                const endpoint = `/course/${courseId}/${chapterId}/${lessonId}/code`;
                const responseData = await requestWithAuth<CodeLessonApiResponse>(endpoint);

                if (responseData.currentLesson) {
                    setCurrentLesson(responseData.currentLesson);
                    setIsCompleted(responseData.isCompleted);

                    // Logic hiển thị code:
                    // 1. Nếu có lastSubmission -> dùng code từ lastSubmission
                    // 2. Nếu không có lastSubmission nhưng có userSubmission -> dùng userSubmission
                    // 3. Nếu không có gì -> dùng initialCode

                    if (responseData.lastSubmission) {
                        setLastSubmission(responseData.lastSubmission);
                        setUserCode(responseData.lastSubmission.submittedCode);
                        console.log('📝 Loaded code from lastSubmission:', {
                            id: responseData.lastSubmission.id,
                            status: responseData.lastSubmission.status,
                            isCorrect: responseData.lastSubmission.isCorrect,
                            submittedAt: responseData.lastSubmission.submittedAt
                        });
                    } else if (responseData.userSubmission) {
                        setUserSubmission(responseData.userSubmission);
                        setUserCode(responseData.userSubmission.submittedCode);
                        console.log('📝 Loaded code from userSubmission');
                    } else {
                        setUserCode(responseData.currentLesson.initialCode || '');
                        console.log('📝 Loaded initial code');
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

    const setLoadingOutput = (message: string) => {
        setOutputResult({
            success: false,
            output: message,
            error: '',
            executionTime: 0,
            memoryUsed: 0,
            status: 'loading',
            isCorrect: null,
            actualOutput: null,
            expectedOutput: null
        });
    };

    const handleRunCode = async () => {
        if (!currentLesson || !userCode.trim()) {
            setOutputResult({
                success: false,
                output: '',
                error: 'Code không được để trống',
                executionTime: 0,
                memoryUsed: 0,
                status: 'error',
                isCorrect: null,
                actualOutput: null,
                expectedOutput: null,
                input: ''
            });
            setIsSuccess(false);
            return;
        }

        setIsRunning(true);
        setIsSuccess(null);
        setIsSubmission(false);

        // Show loading state
        setLoadingOutput(`Đang thực thi code ${currentLesson.language}...\nVui lòng chờ trong giây lát...`);

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

            // Call API
            const responseData = await requestPostWithAuth<CodeExecutionResponse>(
                '/code/execute',
                requestData
            );

            const networkTime = Date.now() - startTime;
            console.log(`✅ Response received in ${networkTime}ms:`, responseData);

            const result = responseData.result;

            // Set result with input field
            setOutputResult({
                ...result,
                input: requestData.input, // Thêm input vào result
                output: result.output + (networkTime > 1000 ? `\n\n[Network: ${networkTime}ms]` : '')
            });

            setIsSuccess(result.success);

        } catch (error) {
            console.error('❌ Code execution failed:', error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            setOutputResult({
                success: false,
                output: '',
                error: `Lỗi mạng/API: ${errorMessage}\n\nNguyên nhân có thể:\n• Mất kết nối internet\n• Server tạm thời không khả dụng\n• Định dạng request không hợp lệ\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.`,
                executionTime: 0,
                memoryUsed: 0,
                status: 'network_error',
                isCorrect: null,
                actualOutput: null,
                expectedOutput: null,
                input: currentLesson.testCaseInput || ""
            });

            setIsSuccess(false);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        if (!currentLesson || !userCode.trim()) {
            setOutputResult({
                success: false,
                output: '',
                error: 'Code không được để trống',
                executionTime: 0,
                memoryUsed: 0,
                status: 'error',
                isCorrect: null,
                actualOutput: null,
                expectedOutput: null,
                input: ''
            });
            setIsSuccess(false);
            return;
        }

        setIsRunning(true);
        setIsSuccess(null);
        setIsSubmission(true);

        // Show loading state for submission
        setLoadingOutput(`Đang nộp bài ${currentLesson.language}...\nĐang thực thi và chấm điểm...\nVui lòng chờ trong giây lát...`);

        try {
            const requestData = {
                courseId: courseId,
                chapterId: chapterId,
                lessonId: lessonId,
                code: userCode,
                language: currentLesson.language.toLowerCase(),
                input: currentLesson.testCaseInput || "",
                expectedOutput: currentLesson.testCaseOutput || null
            };

            console.log('🚀 Sending submission request:', {
                courseId,
                chapterId,
                lessonId,
                language: requestData.language,
                codeLength: requestData.code.length,
                hasInput: !!requestData.input,
                hasExpectedOutput: !!requestData.expectedOutput
            });

            const startTime = Date.now();

            // Call submit API
            const responseData = await requestPostWithAuth<CodeExecutionResponse>(
                `/course/submit-code`,
                requestData
            );

            const networkTime = Date.now() - startTime;
            console.log(`✅ Submission response received in ${networkTime}ms:`, responseData);

            const result = responseData.result;

            // Set result with input field
            setOutputResult({
                ...result,
                input: requestData.input, // Thêm input vào result
                output: result.output + (networkTime > 1000 ? `\n\n[Network: ${networkTime}ms]` : '')
            });

            setIsSuccess(result.success && result.isCorrect);

            // Handle completion status and notifications
            if (result.success && result.isCorrect) {
                setIsCompleted(true);
                showNotification('success',
                    'Nộp bài thành công!',
                    'Chúc mừng! Bạn đã hoàn thành bài học này.'
                );
            } else if (result.success && result.isCorrect === false) {
                showNotification('info',
                    'Chưa đúng, thử lại nhé!',
                    'Hãy kiểm tra output format và thử lại.'
                );
            } else {
                showNotification('error',
                    'Lỗi khi chạy code',
                    'Có lỗi xảy ra khi thực thi code.'
                );
            }

        } catch (error) {
            console.error('❌ Code submission failed:', error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            setOutputResult({
                success: false,
                output: '',
                error: `Lỗi mạng khi nộp bài: ${errorMessage}\n\nNguyên nhân có thể:\n• Mất kết nối internet\n• Server tạm thời không khả dụng\n• Định dạng request không hợp lệ\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.\n\n⚠️ Bài của bạn CHƯA được lưu. Vui lòng nộp lại khi đã có kết nối.`,
                executionTime: 0,
                memoryUsed: 0,
                status: 'network_error',
                isCorrect: null,
                actualOutput: null,
                expectedOutput: null,
                input: currentLesson.testCaseInput || ""
            });

            setIsSuccess(false);

            showNotification('error',
                'Lỗi mạng',
                'Không thể kết nối đến server. Vui lòng thử lại.'
            );
        } finally {
            setIsRunning(false);
        }
    };

    const resetCode = () => {
        setUserCode(currentLesson?.initialCode || '');
        setOutput('');
        setIsSuccess(null);
        setOutputResult(null);
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(userCode);
            showNotification('success', 'Đã copy!', 'Code đã được copy vào clipboard.');
        } catch (err) {
            console.error('Failed to copy code:', err);
            showNotification('error', 'Lỗi copy', 'Không thể copy code.');
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
                    lastSubmission={lastSubmission} // Added this prop
                    handleEditorDidMount={handleEditorDidMount}
                    outputResult={outputResult}
                    isSubmission={isSubmission}
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