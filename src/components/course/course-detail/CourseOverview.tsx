import { CourseFeedback } from "./CourseFeedback";
import { CourseBasicDTO, FeedbackData } from "../../../types/course";
import React, { useEffect, useRef } from 'react';
// Import Prism core và theme
import Prism from 'prismjs';
import '../../../styles/prism-custom.css'
// Import các ngôn ngữ cụ thể
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-sql';

import { CheckCircle, BookOpen, Users, MessageSquare } from 'lucide-react';


interface CourseOverviewProps {
    courseData: CourseBasicDTO;
    feedbacks: FeedbackData[];
    hasMoreFeedbacks: boolean;
    isLoadingMore?: boolean;
    onLoadMoreFeedbacks: () => void;
    onSubmitFeedback: (rating: number, comment: string) => void;
    isLoadingFeedback: boolean;
}


export const CourseOverview: React.FC<CourseOverviewProps> = ({
                                                                  courseData,
                                                                  feedbacks,
                                                                  hasMoreFeedbacks,
                                                                  isLoadingMore = false,
                                                                  onLoadMoreFeedbacks,
                                                                  onSubmitFeedback,
                                                                  isLoadingFeedback = false
                                                              }) => {
    const descriptionRef = useRef<HTMLElement>(null);
    const learningPointsRef = useRef<HTMLElement>(null);
    const prerequisitesRef = useRef<HTMLElement>(null);
    const feedbackRef = useRef<HTMLElement>(null);

    useEffect(() => {
        Prism.highlightAll();
    }, []);

    const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
        if (ref.current) {
            const navHeight = 100; // Chiều cao của navigation menu

            // Lấy vị trí tuyệt đối của element từ đỉnh của document
            const elementTop = ref.current.offsetTop;

            window.scrollTo({
                top: elementTop - navHeight,
                behavior: 'smooth'
            });
        }
    };

    const navigationItems = [
        { label: 'Mô tả', ref: descriptionRef, icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Nội dung học', ref: learningPointsRef, icon: <CheckCircle className="w-4 h-4" /> },
        { label: 'Yêu cầu', ref: prerequisitesRef, icon: <Users className="w-4 h-4" /> },
        { label: 'Đánh giá', ref: feedbackRef, icon: <MessageSquare className="w-4 h-4" /> }
    ];

    return (
        <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm">
            {/* Navigation Menu */}
            <nav className="sticky top-0 z-10 bg-white border-b pb-4">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                    {navigationItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToSection(item.ref)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600
                                     min-w-fit rounded-full hover:bg-blue-50 transition-all duration-200
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Mô tả khóa học */}
            <section ref={descriptionRef} id="description"
                     className="transition-all duration-300 hover:shadow-md p-6 rounded-lg bg-gray-50">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-500"/>
                    Mô tả khóa học
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                    {courseData.description ? (
                        <div
                            dangerouslySetInnerHTML={{__html: courseData.description}}
                            className="course-content leading-relaxed prose-headings:all-unset prose-p:all-unset"
                        />
                    ) : (
                        <p className="text-gray-500 italic">Chưa có mô tả cho khóa học này.</p>
                    )}
                </div>
            </section>


            {/* Mục tiêu học tập */}
            <section ref={learningPointsRef} id="learning-points"
                     className="transition-all duration-300 hover:shadow-md p-6 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500"/>
                    Bạn sẽ học được gì
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courseData.learningPoints.map(point => (
                        <div
                            key={point.id}
                            className="flex items-start space-x-3 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-500"/>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{point.content}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Yêu cầu đầu vào */}
            <section ref={prerequisitesRef} id="prerequisites"
                     className="transition-all duration-300 hover:shadow-md p-6 rounded-lg bg-gradient-to-br from-purple-50 to-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-500"/>
                    Yêu cầu đầu vào
                </h2>
                <div className="grid gap-4">
                    {courseData.prerequisites.map(prerequisite => (
                        <div
                            key={prerequisite.id}
                            className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-3"
                        >
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <p className="text-gray-700 leading-relaxed">{prerequisite.content}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Phản hồi khóa học */}
            <section ref={feedbackRef} id="feedback"
                     className="transition-all duration-300 hover:shadow-md p-6 rounded-lg bg-gray-50">
                <CourseFeedback
                    feedbacks={feedbacks}
                    isEnrolled={courseData.enrolled}
                    hasMoreFeedbacks={hasMoreFeedbacks}
                    isLoadingMore={isLoadingMore}
                    onLoadMoreFeedbacks={onLoadMoreFeedbacks}
                    onSubmitFeedback={onSubmitFeedback}
                    isLoadingFeedback={isLoadingFeedback}
                    courseId={courseData.id}
                />
            </section>
        </div>
    );
};