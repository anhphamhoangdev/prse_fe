import React, { useState } from 'react';
import { BookOpen, Clock, FileText, Notebook, Copy, Check } from "lucide-react";
import { EnrollButton } from "./EnrollButton";
import { CourseBasicDTO } from "../../../types/course";

interface CourseSidebarProps {
    courseData: CourseBasicDTO;
    onAddToCart?: () => void;
    onBuyNow?: () => void;
    onStartLearning?: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
                                                                courseData,
                                                                onAddToCart,
                                                                onBuyNow,
                                                                onStartLearning
                                                            }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4 shadow-sm">
            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">{courseData.title} bao gồm:</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center space-x-3 text-gray-700">
                            <FileText className="w-4 h-4 text-blue-600"/>
                            <span>Tài liệu có thể tải xuống</span>
                        </li>
                        <li className="flex items-center space-x-3 text-gray-700">
                            <Notebook className="w-4 h-4 text-blue-600"/>
                            <span>Bài tập</span>
                        </li>
                        <li className="flex items-center space-x-3 text-gray-700">
                            <Clock className="w-4 h-4 text-blue-600"/>
                            <span>Cập nhật nội dung thường xuyên</span>
                        </li>
                        <li className="flex items-center space-x-3 text-gray-700">
                            <BookOpen className="w-4 h-4 text-blue-600"/>
                            <span>Quyền truy cập trọn đời</span>
                        </li>
                    </ul>
                </div>

                <EnrollButton
                    isEnrolled={courseData.enrolled}
                    originalPrice={courseData.originalPrice}
                    discountPrice={courseData.discountPrice}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onStartLearning={onStartLearning}
                    isAside={true}
                />

                {/* Simple Share Button */}
                <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Đã sao chép link</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            <span>Sao chép link khóa học</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};