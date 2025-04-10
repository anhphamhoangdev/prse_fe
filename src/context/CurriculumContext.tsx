// src/context/CurriculumContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chapter } from '../types/course';
import { requestWithAuth } from '../utils/request';

interface CurriculumApiData {
    chapters: { chapters: Chapter[] };
}

interface CurriculumContextType {
    curriculum: Chapter[] | null;
    isLoading: boolean;
    fetchCurriculum: (courseId: string) => void;
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

export const CurriculumProvider: React.FC<{ children: ReactNode; courseId: string }> = ({ children, courseId }) => {
    const [curriculum, setCurriculum] = useState<Chapter[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCurriculum = async (courseId: string) => {
        if (curriculum && curriculum.length > 0) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const data = await requestWithAuth<CurriculumApiData>(`/course/${courseId}/curriculum`);
            setCurriculum(data.chapters.chapters);
        } catch (error) {
            console.error('Error fetching curriculum:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchCurriculum(courseId);
    }, [courseId]);

    return (
        <CurriculumContext.Provider value={{ curriculum, isLoading, fetchCurriculum }}>
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