import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPostWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {
    Code,
    Save,
    Loader2,
    Terminal,
    Settings,
    Star,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';

interface CodeLessonEditorProps {
    courseId: string | undefined;
    chapterId: string | undefined;
    onSubmit: (lessonData: any) => Promise<void>;
    loading: boolean;
}

const CodeLessonEditor: React.FC<CodeLessonEditorProps> = ({
                                                               courseId,
                                                               chapterId,
                                                               onSubmit,
                                                               loading,
                                                           }) => {
    // Code lesson states
    const [codeLanguage, setCodeLanguage] = useState('python');
    const [codeContent, setCodeContent] = useState('');
    const [initialCode, setInitialCode] = useState('');
    const [solutionCode, setSolutionCode] = useState('');
    const [expectedOutput, setExpectedOutput] = useState('');
    const [hint, setHint] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [testCaseInput, setTestCaseInput] = useState('');
    const [testCaseOutput, setTestCaseOutput] = useState('');
    const [testCaseDescription, setTestCaseDescription] = useState('');

    const submitCodeContent = async (lessonId: number) => {
        if (codeContent.trim() && solutionCode.trim()) {
            const codePayload = {
                language: codeLanguage,
                content: codeContent.trim(),
                initialCode: initialCode.trim() || null,
                solutionCode: solutionCode.trim(),
                expectedOutput: expectedOutput.trim() || null,
                hints: hint.trim() || null,
                difficultyLevel: difficulty,
                testCase: testCaseInput.trim() || testCaseOutput.trim() ? {
                    input: testCaseInput.trim(),
                    expectedOutput: testCaseOutput.trim(),
                    description: testCaseDescription.trim(),
                } : null,
            };

            await requestPostWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}/lesson/${lessonId}/code-draft`,
                codePayload
            );
        }
    };

    const handleSubmit = async () => {
        const lessonData = {
            submitContent: submitCodeContent,
        };
        await onSubmit(lessonData);
    };

    const isFormValid = () => {
        return codeContent.trim() && solutionCode.trim();
    };

    const languageOptions = [
        {
            value: 'python',
            name: 'Python',
            icon: Terminal,
            color: 'bg-green-50 border-green-200 text-green-700',
            activeColor: 'bg-green-100 border-green-400 text-green-800',
        },
        {
            value: 'cpp',
            name: 'C++',
            icon: Settings,
            color: 'bg-blue-50 border-blue-200 text-blue-700',
            activeColor: 'bg-blue-100 border-blue-400 text-blue-800',
        },
    ];

    const difficultyOptions = [
        {
            value: 'EASY',
            name: 'Dễ',
            icon: Star,
            color: 'bg-green-50 border-green-200 text-green-700',
            activeColor: 'bg-green-100 border-green-400 text-green-800',
        },
        {
            value: 'MEDIUM',
            name: 'Trung bình',
            icon: TrendingUp,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
            activeColor: 'bg-yellow-100 border-yellow-400 text-yellow-800',
        },
        {
            value: 'HARD',
            name: 'Khó',
            icon: AlertTriangle,
            color: 'bg-red-50 border-red-200 text-red-700',
            activeColor: 'bg-red-100 border-red-400 text-red-800',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 border-b pb-4">
                <Code className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Tạo Bài Tập Lập Trình</h2>
            </div>

            {/* Basic Settings */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ lập trình</label>
                        <div className="grid grid-cols-2 gap-3">
                            {languageOptions.map((lang) => {
                                const IconComponent = lang.icon;
                                return (
                                    <button
                                        key={lang.value}
                                        type="button"
                                        onClick={() => setCodeLanguage(lang.value)}
                                        className={`
                      p-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2
                      ${codeLanguage === lang.value ? lang.activeColor : lang.color}
                      hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500
                    `}
                                    >
                                        <IconComponent className="w-6 h-6" />
                                        <span className="text-sm font-medium">{lang.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                        <div className="grid grid-cols-3 gap-3">
                            {difficultyOptions.map((diff) => {
                                const IconComponent = diff.icon;
                                return (
                                    <button
                                        key={diff.value}
                                        type="button"
                                        onClick={() => setDifficulty(diff.value)}
                                        className={`
                      p-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2
                      ${difficulty === diff.value ? diff.activeColor : diff.color}
                      hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500
                    `}
                                    >
                                        <IconComponent className="w-6 h-6" />
                                        <span className="text-sm font-medium">{diff.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Problem Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả bài tập <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={codeContent}
                        onChange={(e) => setCodeContent(e.target.value)}
                        placeholder="Mô tả chi tiết bài tập, yêu cầu, ví dụ input/output..."
                        rows={6}
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
                    />
                </div>

                {/* Initial Code Template */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code khởi tạo (cho học sinh)</label>
                    <textarea
                        value={initialCode}
                        onChange={(e) => setInitialCode(e.target.value)}
                        placeholder={
                            codeLanguage === 'python'
                                ? "def solve_problem():\n    # Viết code ở đây\n    pass"
                                : "// Viết code ở đây"
                        }
                        rows={8}
                        className="w-full p-4 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Code mẫu sẵn có cho học sinh khi bắt đầu làm bài</p>
                </div>

                {/* Solution Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code giải mẫu <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={solutionCode}
                        onChange={(e) => setSolutionCode(e.target.value)}
                        placeholder="Nhập code giải mẫu đầy đủ..."
                        rows={12}
                        className="w-full p-4 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Expected Output */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Output mong đợi (ví dụ)</label>
                    <textarea
                        value={expectedOutput}
                        onChange={(e) => setExpectedOutput(e.target.value)}
                        placeholder="Ví dụ: solve_problem(2, 3) => 5"
                        rows={3}
                        className="w-full p-4 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Test Case */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Case (tùy chọn)</label>
                    <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Input</label>
                                <textarea
                                    value={testCaseInput}
                                    onChange={(e) => setTestCaseInput(e.target.value)}
                                    placeholder="Input data..."
                                    rows={3}
                                    className="w-full p-3 text-sm border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Expected Output</label>
                                <textarea
                                    value={testCaseOutput}
                                    onChange={(e) => setTestCaseOutput(e.target.value)}
                                    placeholder="Expected output..."
                                    rows={3}
                                    className="w-full p-3 text-sm border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                                <textarea
                                    value={testCaseDescription}
                                    onChange={(e) => setTestCaseDescription(e.target.value)}
                                    placeholder="Mô tả test case..."
                                    rows={3}
                                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hint */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gợi ý cho học sinh</label>
                    <input
                        type="text"
                        value={hint}
                        onChange={(e) => setHint(e.target.value)}
                        placeholder="Nhập gợi ý cho học sinh..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Preview Summary */}
                <div className="p-5 bg-indigo-50 rounded-lg shadow-sm">
                    <h4 className="text-lg font-medium text-indigo-900 mb-3">Tóm tắt bài tập</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-indigo-700 font-medium">Ngôn ngữ:</span>
                            <p className="text-indigo-900">{codeLanguage.toUpperCase()}</p>
                        </div>
                        <div>
                            <span className="text-indigo-700 font-medium">Độ khó:</span>
                            <p className="text-indigo-900">{difficulty}</p>
                        </div>
                        <div>
                            <span className="text-indigo-700 font-medium">Test case:</span>
                            <p className="text-indigo-900">{testCaseInput || testCaseOutput ? 'Có' : 'Không'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Link
                    to={`/instructor/course/${courseId}/chapter/${chapterId}`}
                    className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                    Hủy
                </Link>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !isFormValid()}
                    className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all font-medium"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang tạo...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Tạo bài học
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CodeLessonEditor;