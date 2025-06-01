import {CodeLessonData} from "../../types/code";
import {Lightbulb, Target} from "lucide-react";

export const TestCases: React.FC<{
    currentLesson: CodeLessonData;
}> = ({ currentLesson }) => {
    if (!currentLesson.testCaseInput && !currentLesson.testCaseOutput) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Test Cases</h2>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentLesson.testCaseInput && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Input:</label>
                            <div className="bg-gray-900 rounded-lg border overflow-hidden">
                                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono">stdin</span>
                                </div>
                                <div className="p-4">
                                    <pre className="text-sm font-mono text-blue-400">{currentLesson.testCaseInput}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentLesson.testCaseOutput && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Expected Output:</label>
                            <div className="bg-gray-900 rounded-lg border overflow-hidden">
                                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono">stdout</span>
                                </div>
                                <div className="p-4">
                                    <pre className="text-sm font-mono text-green-400">{currentLesson.testCaseOutput}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {currentLesson.testCaseDescription && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Mô tả:
                        </h4>
                        <p className="text-blue-700">{currentLesson.testCaseDescription}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
