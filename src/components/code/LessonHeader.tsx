import React from 'react';
import { Award } from 'lucide-react';
import { Lesson } from '../../types/course';
import {CodeLessonData} from "../../types/code";

interface LessonHeaderProps {
    lessonInfo: Lesson | null;
    currentLesson: CodeLessonData;
    isCompleted: boolean;
    languageConfig: {
        color: string;
        textColor: string;
        bgColor: string;
        extension: string;
        monaco: string;
    };
    difficulty: {
        icon: React.ComponentType<any>;
        color: string;
        name: string;
    };
    getLanguageIcon: (language: string) => React.ComponentType<any>;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({
                                                       lessonInfo,
                                                       currentLesson,
                                                       isCompleted,
                                                       languageConfig,
                                                       difficulty,
                                                       getLanguageIcon
                                                   }) => {
    const LanguageIcon = getLanguageIcon(currentLesson.language);
    const DifficultyIcon = difficulty.icon;

    return (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg ${languageConfig.color} flex items-center justify-center shadow-md`}>
                            <LanguageIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {lessonInfo?.title || 'Bài học lập trình'}
                            </h1>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${languageConfig.bgColor} ${languageConfig.textColor} border`}>
                                    {currentLesson.language.toUpperCase()}
                                </span>
                                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold border ${difficulty.color}`}>
                                    <DifficultyIcon className="w-4 h-4" />
                                    <span>{difficulty.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {isCompleted && (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-semibold shadow-lg">
                            <Award className="w-4 h-4" />
                            <span>Hoàn thành</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonHeader;