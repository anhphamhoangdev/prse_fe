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
    AlertCircle,
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
    const [codeLanguage, setCodeLanguage] = useState('');
    const [codeContent, setCodeContent] = useState('');
    const [initialCode, setInitialCode] = useState('');
    const [solutionCode, setSolutionCode] = useState('');
    const [expectedOutput, setExpectedOutput] = useState('');
    const [hint, setHint] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [testCaseInput, setTestCaseInput] = useState('');
    const [testCaseOutput, setTestCaseOutput] = useState('');
    const [testCaseDescription, setTestCaseDescription] = useState('');

    // Validation states
    const [errors, setErrors] = useState({
        codeLanguage: false,
        difficulty: false,
        codeContent: false,
        solutionCode: false,
        testCase: false,
    });

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

    const validateForm = () => {
        const newErrors = {
            codeLanguage: !codeLanguage,
            difficulty: !difficulty,
            codeContent: !codeContent.trim(),
            solutionCode: !solutionCode.trim(),
            testCase: !testCaseInput.trim() || !testCaseOutput.trim(),
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        const lessonData = {
            submitContent: submitCodeContent,
        };
        await onSubmit(lessonData);
    };

    const isFormValid = () => {
        return codeLanguage &&
            difficulty &&
            codeContent.trim() &&
            solutionCode.trim() &&
            testCaseInput.trim() &&
            testCaseOutput.trim();
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
        {
            value: 'java',
            name: 'Java',
            icon: Code,
            color: 'bg-orange-50 border-orange-200 text-orange-700',
            activeColor: 'bg-orange-100 border-orange-400 text-orange-800',
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Language Selection */}
                    <div className={`bg-gray-50 p-6 rounded-lg shadow-sm ${errors.codeLanguage ? 'border-2 border-red-300' : ''}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Ngôn ngữ lập trình <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {languageOptions.map((lang) => {
                                const IconComponent = lang.icon;
                                return (
                                    <label
                                        key={lang.value}
                                        className={`
                                            flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200
                                            ${codeLanguage === lang.value ? lang.activeColor : lang.color}
                                            hover:shadow-md hover:scale-[1.02]
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="codeLanguage"
                                            value={lang.value}
                                            checked={codeLanguage === lang.value}
                                            onChange={(e) => {
                                                setCodeLanguage(e.target.value);
                                                setErrors(prev => ({ ...prev, codeLanguage: false }));
                                            }}
                                            className="sr-only"
                                        />
                                        <IconComponent className="w-6 h-6 mr-3" />
                                        <span className="text-sm font-medium">{lang.name}</span>
                                        {codeLanguage === lang.value && (
                                            <div className="ml-auto w-2 h-2 bg-current rounded-full"></div>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                        {errors.codeLanguage && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Vui lòng chọn ngôn ngữ lập trình
                            </p>
                        )}
                    </div>

                    {/* Difficulty Selection */}
                    <div className={`bg-gray-50 p-6 rounded-lg shadow-sm ${errors.difficulty ? 'border-2 border-red-300' : ''}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Độ khó <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {difficultyOptions.map((diff) => {
                                const IconComponent = diff.icon;
                                return (
                                    <label
                                        key={diff.value}
                                        className={`
                                            flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200
                                            ${difficulty === diff.value ? diff.activeColor : diff.color}
                                            hover:shadow-md hover:scale-[1.02]
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="difficulty"
                                            value={diff.value}
                                            checked={difficulty === diff.value}
                                            onChange={(e) => {
                                                setDifficulty(e.target.value);
                                                setErrors(prev => ({ ...prev, difficulty: false }));
                                            }}
                                            className="sr-only"
                                        />
                                        <IconComponent className="w-6 h-6 mr-3" />
                                        <span className="text-sm font-medium">{diff.name}</span>
                                        {difficulty === diff.value && (
                                            <div className="ml-auto w-2 h-2 bg-current rounded-full"></div>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                        {errors.difficulty && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Vui lòng chọn độ khó
                            </p>
                        )}
                    </div>
                </div>

                {/* Problem Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả bài tập <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={codeContent}
                        onChange={(e) => {
                            setCodeContent(e.target.value);
                            setErrors(prev => ({ ...prev, codeContent: false }));
                        }}
                        placeholder="Mô tả chi tiết bài tập, yêu cầu, ví dụ input/output..."
                        rows={6}
                        className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y ${
                            errors.codeContent ? 'border-red-300' : 'border-gray-200'
                        }`}
                    />
                    {errors.codeContent && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Vui lòng nhập mô tả bài tập
                        </p>
                    )}
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
                                : codeLanguage === 'cpp'
                                    ? "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Viết code ở đây\n    return 0;\n}"
                                    : codeLanguage === 'java'
                                        ? "public class Solution {\n    public static void main(String[] args) {\n        // Viết code ở đây\n    }\n}"
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
                        onChange={(e) => {
                            setSolutionCode(e.target.value);
                            setErrors(prev => ({ ...prev, solutionCode: false }));
                        }}
                        placeholder="Nhập code giải mẫu đầy đủ..."
                        rows={12}
                        className={`w-full p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                            errors.solutionCode ? 'border-red-300' : 'border-gray-200'
                        }`}
                    />
                    {errors.solutionCode && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Vui lòng nhập code giải mẫu
                        </p>
                    )}
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

                {/* Test Case - Required */}
                <div className={`${errors.testCase ? 'border-2 border-red-300 rounded-lg p-1' : ''}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Case <span className="text-red-500">*</span>
                    </label>
                    <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Input <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={testCaseInput}
                                    onChange={(e) => {
                                        setTestCaseInput(e.target.value);
                                        setErrors(prev => ({ ...prev, testCase: false }));
                                    }}
                                    placeholder="Input data..."
                                    rows={3}
                                    className={`w-full p-3 text-sm border rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                        errors.testCase ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Expected Output <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={testCaseOutput}
                                    onChange={(e) => {
                                        setTestCaseOutput(e.target.value);
                                        setErrors(prev => ({ ...prev, testCase: false }));
                                    }}
                                    placeholder="Expected output..."
                                    rows={3}
                                    className={`w-full p-3 text-sm border rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                        errors.testCase ? 'border-red-300' : 'border-gray-200'
                                    }`}
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
                        {errors.testCase && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Vui lòng nhập Input và Expected Output cho test case
                            </p>
                        )}
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
                            <p className="text-indigo-900">{codeLanguage ? codeLanguage.toUpperCase() : 'Chưa chọn'}</p>
                        </div>
                        <div>
                            <span className="text-indigo-700 font-medium">Độ khó:</span>
                            <p className="text-indigo-900">{difficulty || 'Chưa chọn'}</p>
                        </div>
                        <div>
                            <span className="text-indigo-700 font-medium">Test case:</span>
                            <p className="text-indigo-900">{testCaseInput && testCaseOutput ? 'Có' : 'Chưa có'}</p>
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