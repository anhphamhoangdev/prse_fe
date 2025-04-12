// src/layouts/CourseDetailLayout.tsx
import React, { useState } from 'react';
import { SearchHeaderAndFooterLayout } from './UserLayout';
import CurriculumSidebar from '../components/course/course-detail/CurriculumSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';
import {Lesson} from "../types/course";

interface CourseDetailLayoutProps {
    courseId: string | undefined;
    currentLessonId: string | undefined;
    onLessonSelect: (lesson: Lesson, chapterId: number) => void;
    children: React.ReactNode; // Nội dung chính (video hoặc quiz)
}

const CourseDetailLayout: React.FC<CourseDetailLayoutProps> = ({
                                                                   courseId,
                                                                   currentLessonId,
                                                                   onLessonSelect,
                                                                   children,
                                                               }) => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);

    return (
        <SearchHeaderAndFooterLayout>
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto py-6 px-4 lg:px-6 flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <AnimatePresence>
                        {isSidebarVisible && (
                            <motion.div
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="lg:w-1/3 w-full"
                            >
                                <CurriculumSidebar
                                    courseId={courseId}
                                    currentLessonId={currentLessonId}
                                    onLessonSelect={onLessonSelect}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Nội dung chính */}
                    <div
                        className={`relative flex-grow transition-all duration-300 ${
                            isSidebarVisible ? 'lg:w-2/3' : 'w-full max-w-4xl mx-auto'
                        }`}
                    >
                        <button
                            onClick={toggleSidebar}
                            className="absolute top-4 left-4 z-20 p-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center"
                        >
                            {isSidebarVisible ? (
                                <X className="w-6 h-6 text-gray-700 transition-transform duration-200 hover:scale-110" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700 transition-transform duration-200 hover:scale-110" />
                            )}
                        </button>
                        {children}
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};

export default CourseDetailLayout;