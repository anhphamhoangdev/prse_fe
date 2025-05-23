import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CourseInfoEdit from "../../components/instructor/CourseInfoEdit";
import {putWithAuth, requestWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";
import {ChapterInstructorEdit, CourseInstructorEdit} from "../../types/course";



const CourseEdit: React.FC = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<CourseInstructorEdit | null>(null);
    const [chapters, setChapters] = useState<ChapterInstructorEdit[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const [infoLoading, setInfoLoading] = useState(false);
    const [curriculumLoading, setCurriculumLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true); // loading cho lần đầu fetch data


    useEffect(() => {
        const fetchData = async () => {
            if (!courseId) return;

            try {
                const [courseResponse, chaptersResponse] = await Promise.all([
                    requestWithAuth<{ course: CourseInstructorEdit }>(
                        `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}`
                    ),
                    requestWithAuth<{ chapters: ChapterInstructorEdit[] }>(
                        `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/curriculum`
                    )
                ]);

                setCourse(courseResponse.course);

                // // Sắp xếp chapters theo orderIndex
                // const sortedChapters = chaptersResponse.chapters.sort((a, b) => a.orderIndex - b.orderIndex);
                //
                // // Sắp xếp lessons trong mỗi chapter theo orderIndex
                // const chaptersWithSortedLessons = sortedChapters.map(chapter => ({
                //     ...chapter,
                //     lessons: chapter.lessons.sort((a, b) => a.orderIndex - b.orderIndex)
                // }));

                setChapters(chaptersResponse.chapters);
            } catch (error) {
                console.error('Error fetching course data:', error);
                setErrorMessage('Không thể tải thông tin khóa học. Vui lòng thử lại sau.');
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    const handleInfoChange = (field: keyof CourseInstructorEdit, value: any) => {
        if (course) {
            setCourse({
                ...course,
                [field]: value
            });
        }
    };

    const handleSubmitInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;

        try {
            setInfoLoading(true);
            const courseInfo = {
                title: course.title,
                description: course.description,
                shortDescription: course.shortDescription,
                imageUrl: course.imageUrl,
                language: course.language,
                isPublish: course.isPublish,
                previewVideoUrl: course.previewVideoUrl,
                previewVideoDuration: course.previewVideoDuration,
                originalPrice: course.originalPrice,
            };

            await putWithAuth(
                `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}`,
                { course: courseInfo }
            );
            setErrorMessage('');
        } catch (error) {
            console.error('Error updating course info:', error);
            setErrorMessage('Không thể cập nhật thông tin khóa học. Vui lòng thử lại sau.');
        } finally {
            setInfoLoading(false);
        }
    };

    const handleSubmitCurriculum = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCurriculumLoading(true);
            // await requestWithAuth(
            //     `${ENDPOINTS.INSTRUCTOR.COURSES}/${courseId}/curriculum`,
            //     'PUT',
            //     { chapters }
            // );

            console.log("CHAPTER : ",chapters)
            setErrorMessage('');
        } catch (error) {
            console.error('Error updating curriculum:', error);
            setErrorMessage('Không thể cập nhật nội dung khóa học. Vui lòng thử lại sau.');
        } finally {
            setCurriculumLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-6 text-center text-red-600">
                {errorMessage || 'Không tìm thấy khóa học'}
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Chỉnh sửa khóa học</h1>

            <CourseInfoEdit
                course={course}
                chapters={chapters}
                errorMessage={errorMessage}
                onInfoChange={handleInfoChange}
                onChaptersChange={setChapters}
                onInfoSubmit={handleSubmitInfo}
                onCurriculumSubmit={handleSubmitCurriculum}
                infoLoading={infoLoading}
                curriculumLoading={curriculumLoading}

            />
        </div>
    );
};

export default CourseEdit;