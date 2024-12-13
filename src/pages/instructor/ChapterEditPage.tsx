import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { requestWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import { ChapterInstructorEdit, LessonInstructorEdit } from "../../types/course";
import ChapterLessons from "../../components/instructor/ChapterLessonDetail";

const ChapterEditPage: React.FC = () => {
    const { courseId, chapterId } = useParams();
    const [chapter, setChapter] = useState<ChapterInstructorEdit | null>(null);
    const [lessons, setLessons] = useState<LessonInstructorEdit[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [pageLoading, setPageLoading] = useState(true);

    const fetchChapterData = async (courseId: string, chapterId: string) => {
        try {
            const response = await requestWithAuth<{ chapter: ChapterInstructorEdit }>(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}`
            );
            setChapter(response.chapter);
            return response.chapter;
        } catch (error) {
            console.error('Error fetching chapter data:', error);
            throw error;
        }
    };

    useEffect(() => {

        window.scrollTo(0, 0);

        const fetchData = async () => {
            if (!courseId || !chapterId) return;

            setPageLoading(true);
            try {
                const chapter = await fetchChapterData(courseId, chapterId);
                setChapter(chapter);
                setLessons(chapter.lessons);
            } catch (error) {
                setErrorMessage('Không thể tải thông tin chương học. Vui lòng thử lại sau.');
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
    }, [courseId, chapterId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!courseId || !chapterId) return;

            try {
                const [chapterResponse] = await Promise.all([
                    requestWithAuth<{ chapter: ChapterInstructorEdit }>(
                        `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/chapter/${chapterId}`
                    )
                ]);
                setChapter(chapterResponse.chapter);
                setLessons(chapterResponse.chapter.lessons);
            } catch (error) {
                console.error('Error fetching chapter data:', error);
                setErrorMessage('Không thể tải thông tin chương học. Vui lòng thử lại sau.');
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
    }, [courseId, chapterId]);

    const handleLessonsChange = (updatedLessons: LessonInstructorEdit[]) => {
        setLessons(updatedLessons);
    };

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="p-6 text-center text-red-600">
                {errorMessage || 'Không tìm thấy chương học'}
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <ChapterLessons
                chapter={chapter}
                lessons={lessons}
                errorMessage={errorMessage}
                onLessonsChange={handleLessonsChange}
                courseId={courseId!}
                onChapterUpdate={fetchChapterData} // Thêm prop onChapterUpdate
            />
        </div>
    );
};

export default ChapterEditPage;