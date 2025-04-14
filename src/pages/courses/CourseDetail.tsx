import React, { useEffect, useState } from 'react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import { CourseSidebar } from "../../components/course/course-detail/CourseSidebar";
import { CourseContent } from "../../components/course/course-detail/CourseContent";
import { CourseHero } from "../../components/course/course-detail/CourseHero";
import { CourseOverview } from "../../components/course/course-detail/CourseOverview";
import {Chapter, CourseBasicDTO, CourseCurriculumDTO, FeedbackData} from "../../types/course";
import { useNavigate, useParams } from "react-router-dom";
import { getBasicDetailCourse, getCourseCurriculum, getCourseFeedbacks } from "../../services/courseService";
import { CourseNotFound } from "../../components/course/course-detail/CourseNotFound";
import CourseContentLoading from "../../components/course/course-detail/CourseContentLoading";
import { getLessonPath } from "../../types/lesson";
import { requestPostWithAuth } from "../../utils/request";
import { useNotification } from "../../components/notification/NotificationProvider";
import { addToCart } from "../../services/cartService";
import {Helmet} from "react-helmet";

const handleLessonClick = (chapterId: number, lessonId: number) => {
    console.log(`Navigating to lesson ${lessonId} in chapter ${chapterId}`);
};

const handleBuyNow = () => {
    console.log('Processing purchase...');
};

const TabButton: React.FC<{
    tab: 'overview' | 'content';
    label: string;
    onClick: () => void;
    isActive: boolean;
}> = ({ tab, label, onClick, isActive }) => (
    <button
        className={`pb-4 px-2 ${isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        onClick={onClick}
    >
        {label}
    </button>
);

const CourseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [basicInfo, setBasicInfo] = useState<CourseBasicDTO | null>(null);
    const [curriculum, setCurriculum] = useState<CourseCurriculumDTO | null>(null);
    const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [feedbackMeta, setFeedbackMeta] = useState({
        total: 0,
        currentPage: 1,
        hasMore: true
    });
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
    const { showNotification } = useNotification();

    const handleAddToCartSuccess = () => {
        showNotification('success', 'Thành công', 'Khóa học đã được thêm vào giỏ hàng thành công');
    };

    const handleAddToCartError = (message: string) => {
        showNotification('error', 'Không thành công', message);
    };

    const updateHeaderCartCount = () => {
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
    };

    const handleAddToCart = async () => {
        try {
            const response = await addToCart(Number(id));
            if (response.code === 1) {
                updateHeaderCartCount();
                handleAddToCartSuccess();
            } else {
                handleAddToCartError(response.error_message ? response.error_message : 'Có lỗi xảy ra khi thêm vào giỏ hàng');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            handleAddToCartError('Có lỗi xảy ra khi thêm vào giỏ hàng');
        }
    };

    useEffect(() => {
        const fetchBasicInfo = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (!id) {
                    throw new Error('Course ID is required');
                }
                const data = await getBasicDetailCourse(Number(id));
                if (data === null) {
                    setBasicInfo(null);
                    return;
                }
                setBasicInfo(data);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('An unknown error occurred');
                setError(error);
                setBasicInfo(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchBasicInfo();
        } else {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchInitialFeedbacks = async () => {
            if (!id) return;
            setIsLoadingFeedbacks(true);
            try {
                const data = await getCourseFeedbacks(Number(id), 1);
                if (data) {
                    setFeedbacks(data.items);
                    setFeedbackMeta({
                        total: data.total,
                        currentPage: 2,
                        hasMore: data.hasMore
                    });
                } else {
                    setFeedbacks([]);
                    setFeedbackMeta({
                        total: 0,
                        currentPage: 1,
                        hasMore: false
                    });
                }
            } catch (error) {
                console.error('[CourseDetail] Error loading initial feedbacks:', error);
                setFeedbacks([]);
            } finally {
                setIsLoadingFeedbacks(false);
            }
        };

        fetchInitialFeedbacks();
    }, [id]);

    const loadMoreFeedbacks = async () => {
        if (!id || !feedbackMeta.hasMore || isLoadingFeedbacks) return;
        setIsLoadingFeedbacks(true);
        try {
            const data = await getCourseFeedbacks(Number(id), feedbackMeta.currentPage);
            if (data) {
                setFeedbacks(prev => [...prev, ...data.items]);
                setFeedbackMeta({
                    total: data.total,
                    currentPage: feedbackMeta.currentPage + 1,
                    hasMore: data.hasMore
                });
            }
        } catch (error) {
            console.error('[CourseDetail] Error loading more feedbacks:', error);
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };

    const fetchCurriculum = async (courseId: number) => {
        try {
            setIsLoadingCurriculum(true);
            const data = await getCourseCurriculum(courseId);
            setCurriculum(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch curriculum:', error);
            return null;
        } finally {
            setIsLoadingCurriculum(false);
        }
    };

    useEffect(() => {
        const loadCurriculum = async () => {
            if (activeTab === 'content' && !curriculum && id) {
                await fetchCurriculum(Number(id));
            }
        };
        loadCurriculum();
    }, [activeTab, curriculum, id]);

    const fetchFeedbacks = async (courseId: number, page: number) => {
        setIsLoadingFeedbacks(true);
        try {
            const data = await getCourseFeedbacks(courseId, page);
            return data;
        } catch (error) {
            console.error('[CourseDetail] Error loading feedbacks:', error);
            throw error;
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };

    const handleSubmitFeedback = async (rating: number, comment: string) => {
        if (!id) return;
        try {
            const feedbackData = {
                courseId: Number(id),
                rating: rating,
                comment: comment.trim()
            };
            await requestPostWithAuth<void>('/course/feedback', feedbackData);
            const data = await fetchFeedbacks(Number(id), 1);
            if (data) {
                setFeedbacks(data.items);
                setFeedbackMeta({
                    total: data.total,
                    currentPage: 2,
                    hasMore: data.hasMore
                });
                showNotification('success', 'Thành công', 'Đánh giá của bạn đã được gửi thành công');
            } else {
                setFeedbacks([]);
                setFeedbackMeta({
                    total: 0,
                    currentPage: 1,
                    hasMore: false
                });
            }
        } catch (error) {
            console.error('[CourseDetail] Failed to submit feedback:', error);
            showNotification(
                'error',
                'Lỗi',
                error instanceof Error ? error.message : 'Không thể gửi đánh giá. Vui lòng thử lại sau.'
            );
        }
    };

    const findNextLesson = (chapters: Chapter[]): {
        chapterId: number;
        lessonId: number;
        type: string;
    } | null => {
        for (const chapter of chapters) {
            for (let i = 0; i < chapter.lessons.length; i++) {
                const currentLesson = chapter.lessons[i];
                if (!currentLesson.progress || currentLesson.progress.status !== 'completed') {
                    return {
                        chapterId: chapter.id,
                        lessonId: currentLesson.id,
                        type: currentLesson.type
                    };
                }
                if (currentLesson.progress?.status === 'completed' && i < chapter.lessons.length - 1) {
                    const nextLesson = chapter.lessons[i + 1];
                    if (!nextLesson.progress || nextLesson.progress.status !== 'completed') {
                        return {
                            chapterId: chapter.id,
                            lessonId: nextLesson.id,
                            type: nextLesson.type
                        };
                    }
                }
            }
        }
        if (chapters.length > 0 && chapters[0].lessons.length > 0) {
            return {
                chapterId: chapters[0].id,
                lessonId: chapters[0].lessons[0].id,
                type: chapters[0].lessons[0].type
            };
        }
        return null;
    };

    const handleStartLearning = (
        courseId: string | number,
        isEnrolled: boolean,
        chapters: Chapter[],
        navigate: (path: string) => void
    ): void => {
        if (!isEnrolled) return;
        const nextLesson = findNextLesson(chapters);
        if (nextLesson) {
            const path = getLessonPath(courseId, nextLesson.chapterId, nextLesson.lessonId, nextLesson.type);
            navigate(path);
        } else {
            console.warn('No lessons found in the course');
        }
    };

    const handleStartLearningClick = async () => {
        if (!id) return;
        let currentCurriculum = curriculum;
        if (!currentCurriculum) {
            const fetchedData = await fetchCurriculum(Number(id));
            if (!fetchedData) return;
            currentCurriculum = fetchedData;
        }
        if (currentCurriculum?.chapters) {
            handleStartLearning(Number(id), basicInfo?.enrolled ?? false, currentCurriculum.chapters, navigate);
        }
    };

    if (isLoading) return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>
    );

    if (error || !basicInfo) {
        return <CourseNotFound />;
    }

    return (
        <SearchHeaderAndFooterLayout>
            <Helmet>
                <title>Khóa học tuyệt vời</title>
                <meta name="title" property="og:title" content="Khóa học tuyệt vời"/>
                <meta property="og:description" content="Học và nâng cao kỹ năng của bạn với khóa học này!"/>
                <meta name="image" property="og:image"
                      content="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"/>
                <meta property="og:url" content="https://prse-fe.vercel.app/course-detail/121"/>
                <meta property="og:type" content="website"/>
            </Helmet>
            <CourseHero
                courseData={basicInfo}
                onAddToCart={handleAddToCart}
                onBuyNow={handleAddToCart}
                onStartLearning={handleStartLearningClick}
            />
            <div className="container mx-auto px-4 py-8">
                <div className="flex space-x-8">
                    <div className="w-2/3">
                        <div className="border-b border-gray-200 mb-6">
                            <div className="flex space-x-8">
                                <TabButton
                                    tab="overview"
                                    label="Tổng quan"
                                    onClick={() => setActiveTab('overview')}
                                    isActive={activeTab === 'overview'}
                                />
                                <TabButton
                                    tab="content"
                                    label="Nội dung khoá học"
                                    onClick={() => setActiveTab('content')}
                                    isActive={activeTab === 'content'}
                                />
                            </div>
                        </div>
                        {activeTab === 'overview' ? (
                            <CourseOverview
                                courseData={basicInfo}
                                feedbacks={feedbacks}
                                hasMoreFeedbacks={feedbackMeta.hasMore}
                                onLoadMoreFeedbacks={loadMoreFeedbacks}
                                onSubmitFeedback={handleSubmitFeedback}
                                isLoadingFeedback={isLoadingFeedbacks}
                            />
                        ) : (
                            isLoadingCurriculum ? (
                                <CourseContentLoading />
                            ) : curriculum && (
                                <CourseContent
                                    curriculum={curriculum}
                                    expandedChapters={expandedChapters}
                                    setExpandedChapters={setExpandedChapters}
                                    isEnrolled={basicInfo.enrolled}
                                    courseId={id}
                                    onLessonClick={handleLessonClick}
                                />
                            )
                        )}
                    </div>
                    <div className="w-1/3">
                        <CourseSidebar
                            courseData={basicInfo}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleAddToCart}
                            onStartLearning={handleStartLearningClick}
                        />
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};

export default CourseDetail;