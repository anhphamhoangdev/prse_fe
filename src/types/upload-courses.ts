import React, { ChangeEvent, FocusEvent } from 'react';
import {LucideIcon} from "lucide-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: LucideIcon;
    error?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

export interface FileDropZoneProps {
    accept: string;
    onChange: (file: File | null, duration?: number) => void;
    value: File | null;
    type: 'image' | 'video';
    duration?: number;
}

export interface CourseFormData {
    title: string;
    description: string;
    shortDescription: string;
    language: string;
    originalPrice: number;
    isDiscount: boolean;
    isHot: boolean;
    isPublish: boolean;
    previewVideoDuration?: number;
    subCategoryIds: number[];
    prerequisites: string[];
    objectives: string[];
}

export interface UploadVideoLesson {
    id: number;
    videoUrl: string;
    duration: number;
    lessonId: number;
    createdAt: string;
    updatedAt: string;
}

export interface UploadLesson {
    id: number;
    title: string;
    type: 'video' | 'quiz' | 'text' | 'code';
    isPublish: boolean;
    orderIndex: number;
    chapterId: number;
    createdAt: string;
    updatedAt: string;
    videoLesson?: UploadVideoLesson;
}

export interface UploadChapter {
    id: number;
    title: string;
    orderIndex: number;
    courseId: number;
    createdAt: string;
    updatedAt: string;
    lessons: UploadLesson[];
}