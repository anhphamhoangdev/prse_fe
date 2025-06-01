import {BookOpen, Target} from "lucide-react";
import {CodeLessonData} from "../../types/code";

export const ProblemStatement: React.FC<{
    currentLesson: CodeLessonData;
}> = ({ currentLesson }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Đề bài</h2>
                </div>
            </div>
            <div className="p-6">
                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="leading-relaxed text-base whitespace-pre-line">{currentLesson.content}</p>
                </div>
                {currentLesson.expectedOutput && (
                    <div className="mt-6 p-4 bg-gray-900 rounded-lg border">
                        <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-green-400" />
                            Kết quả mong đợi:
                        </h4>
                        <pre className="text-sm font-mono text-green-400 leading-relaxed">
                            {currentLesson.expectedOutput}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};