import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { Chapter } from '../types/course';
import { requestWithAuth } from '../utils/request';

interface CurriculumApiResponse {
    chapters: {
        totalLessons: number;
        completedLessons: number;
        chapters: Chapter[];
    };
}

interface CurriculumContextProps {
    totalLessons: number;
    completedLessons: number;
    curriculum: Chapter[] | null;
    isLoading: boolean;
    fetchCurriculum: (courseId: string) => Promise<void>;
    updateLessonProgress: (chapterId: number, lessonId: number, status: string) => void;
}

const CurriculumContext = createContext<CurriculumContextProps | undefined>(undefined);

export const CurriculumProvider: React.FC<{ courseId: string; children: React.ReactNode }> = ({
                                                                                                  courseId,
                                                                                                  children,
                                                                                              }) => {
    const [curriculum, setCurriculum] = useState<Chapter[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [totalLessons, setTotalLessons] = useState(0);
    const [completedLessons, setCompletedLessons] = useState(0);
    const fetchCurriculum = useCallback(async (courseId: string) => {
        if (!courseId) return;
        try {
            setIsLoading(true);
            const response = await requestWithAuth<CurriculumApiResponse>(`/course/${courseId}/curriculum`);
            const data = response.chapters.chapters; // Truy cập đúng cấu trúc
            setCurriculum(data);
            setTotalLessons(response.chapters.totalLessons);
            setCompletedLessons(response.chapters.completedLessons);
            console.log('CurriculumProvider :', data);
        } catch (error) {
            console.error('Error fetching curriculum:', error);
            setCurriculum(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateLessonProgress = useCallback((chapterId: number, lessonId: number, status: string) => {
        setCurriculum((prev) => {
            if (!prev) return prev;
            return prev.map((chapter) => {
                if (chapter.id !== chapterId) return chapter;
                return {
                    ...chapter,
                    lessons: chapter.lessons.map((lesson) => {
                        if (lesson.id !== lessonId) return lesson;
                        const wasCompleted = lesson.progress?.status === 'completed';
                        const isCompleted = status === 'completed';
                        if (!wasCompleted && isCompleted) {
                            setCompletedLessons((prev) => prev + 1);
                        } else if (wasCompleted && !isCompleted) {
                            setCompletedLessons((prev) => Math.max(0, prev - 1)); 
                        }
                        return {
                            ...lesson,
                            progress: {
                                ...lesson.progress,
                                status: status as 'not_started' | 'completed' | null,
                            },
                        };
                    }),
                };
            });
        });
    }, []);

    useEffect(() => {
        if (courseId && !curriculum) {
            fetchCurriculum(courseId);
        }
    }, [courseId, curriculum, fetchCurriculum]);

    return (
        <CurriculumContext.Provider value={{ curriculum, totalLessons, completedLessons, isLoading, fetchCurriculum, updateLessonProgress }}>
            {children}
        </CurriculumContext.Provider>
    );
};

export const useCurriculum = () => {
    const context = useContext(CurriculumContext);
    if (!context) {
        throw new Error('useCurriculum must be used within a CurriculumProvider');
    }
    return context;
};