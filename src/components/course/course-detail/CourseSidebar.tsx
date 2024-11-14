import {BookOpen, Code, FileText, Play} from "lucide-react";
import {EnrollButton} from "./EnrollButton";
import React from "react";
import {CourseDetailData} from "../../../types/course";

interface CourseSidebarProps {
    courseData: CourseDetailData;
    onAddToCart?: () => void;
    onBuyNow?: () => void;
    onStartLearning?: () => void;  // Thêm prop mới
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
                                                                courseData,
                                                                onAddToCart,
                                                                onBuyNow,
                                                                onStartLearning
                                                            }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4 shadow-sm">
            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">{courseData.title} includes:</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center space-x-3 text-gray-700">
                            <Play className="w-4 h-4 text-blue-600" />
                            <span>{courseData.totalDuration} of video content</span>
                        </li>
                        <li className="flex items-center space-x-3 text-gray-700">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>Downloadable resources</span>
                        </li>
                        <li className="flex items-center space-x-3 text-gray-700">
                            <Code className="w-4 h-4 text-blue-600" />
                            <span>Coding exercises</span>
                        </li>
                        <li className="flex items-center space-x-3 text-gray-700">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span>Full lifetime access</span>
                        </li>
                    </ul>
                </div>
                <EnrollButton
                    isEnrolled={courseData.isEnrolled}
                    price={courseData.price}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onStartLearning={onStartLearning}
                />
                <p className="text-sm text-center text-gray-500">
                    30-day money-back guarantee
                </p>
            </div>
        </div>
    );
};