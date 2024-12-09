import React, {useEffect, useState} from 'react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import {CourseSidebar} from "../../components/course/course-detail/CourseSidebar";
import {CourseContent} from "../../components/course/course-detail/CourseContent";
import {CourseHero} from "../../components/course/course-detail/CourseHero";
import {CourseOverview} from "../../components/course/course-detail/CourseOverview";
import {Chapter, CourseBasicDTO, CourseCurriculumDTO, FeedbackData} from "../../types/course";
import {useNavigate, useParams} from "react-router-dom";
import {getBasicDetailCourse, getCourseCurriculum, getCourseFeedbacks} from "../../services/courseService";
import {CourseNotFound} from "../../components/course/course-detail/CourseNotFound";
import CourseContentLoading from "../../components/course/course-detail/CourseContentLoading";
import {getLessonPath} from "../../types/lesson";
import {requestPostWithAuth} from "../../utils/request";
import {useNotification} from "../../components/notification/NotificationProvider";


const handleLessonClick = (chapterId: number, lessonId: number) => {
    // Handle navigation or other actions
    // router.push(`/learn/${courseId}/chapters/${chapterId}/lessons/${lessonId}`);
};

const handleAddToCart = () => {
    // Xử lý thêm vào giỏ hàng
    console.log('Adding to cart...');
};

const handleBuyNow = () => {
    // Xử lý mua ngay
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

    // basic info - thong tin tong quan
    const [basicInfo, setBasicInfo] = useState<CourseBasicDTO | null>({
        id: 1,
        title: "Huỷ diệt Java Spring Boot",
        description: "Làm quen với lập trình Back-end bằng Spring Boot từ cơ bản đến nâng cao. Xây dựng RESTful API, xử lý bất đồng bộ, tối ưu hiệu suất và triển khai ứng dụng thực tế.",
        shortDescription: "Làm quen với lập trình Back-end bằng Spring Boot từ cơ bản đến nâng cao.",
        imageUrl: "https://files.fullstack.edu.vn/f8-prod/courses/7.png",
        language: "Tiếng Việt",
        originalPrice: 0,
        discountPrice: 150000,
        averageRating: 4.8,
        totalStudents: 1500,
        totalViews: 5000,
        lastUpdated: "2024-03-01T00:00:00",
        totalDuration: 162000,
        previewVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        previewVideoDuration: 596,
        enrolled: true,

        instructor: {
            id: 1,
            fullName: "John Doe",
            avatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-1/416238737_2395657973950734_3403316050107008880_n.jpg",
            title: "Senior Java Developer & Instructor",
            totalCourses: 8,
            totalStudents: 35000
        },

        subcategories: [
            {
                id: 1,
                name: "Java Spring Boot",
            },
            {
                id: 2,
                name: "Back-end Development",
            }
        ],

        learningPoints: [
            {
                id: 1,
                content: "Xây dựng ứng dụng web với Spring Boot từ A-Z"
            },
            {
                id: 2,
                content: "Thiết kế và phát triển RESTful API chuẩn"
            },
            {
                id: 3,
                content: "Làm việc với cơ sở dữ liệu sử dụng Spring Data JPA"
            },
            {
                id: 4,
                content: "Xử lý bất đồng bộ và tối ưu hiệu suất"
            },
            {
                id: 5,
                content: "Bảo mật ứng dụng với Spring Security"
            },
            {
                id: 6,
                content: "Triển khai ứng dụng lên môi trường production"
            }
        ],

        prerequisites: [
            {
                id: 1,
                content: "Kiến thức cơ bản về Java"
            },
            {
                id: 2,
                content: "Hiểu biết về lập trình hướng đối tượng (OOP)"
            },
            {
                id: 3,
                content: "Cơ bản về HTML, SQL và RESTful API"
            }
        ]
    });

    // curriculum - noi dung khoa hoc
    const [curriculum, setCurriculum] = useState<CourseCurriculumDTO | null>(null);
    const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);



    // chapter expand
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // feedback state
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [feedbackMeta, setFeedbackMeta] = useState({
        total: 0,
        currentPage: 1,
        hasMore: true
    });
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);


    // some
    const { showNotification } = useNotification();


    // fetchBasicInfo
    useEffect(() => {
        const fetchBasicInfo = async () => {
            console.log('[CourseDetail] Starting to fetch course details');
            setIsLoading(true);
            setError(null);

            try {
                if (!id) {
                    throw new Error('Course ID is required');
                }

                const data = await getBasicDetailCourse(Number(id));

                if (data === null) {
                    console.warn(`[CourseDetail] No data found for course ID: ${id}`);
                    setBasicInfo(null);
                    return;
                }

                console.log(`[CourseDetail] Successfully loaded course: ${data.title}`);
                setBasicInfo(data);

            } catch (err) {
                const error = err instanceof Error ? err : new Error('An unknown error occurred');
                console.error('[CourseDetail] Error fetching course details:', error.message);
                setError(error);
                setBasicInfo(null);
            } finally {
                setIsLoading(false);
                console.log('[CourseDetail] Finished fetching course details');
            }
        };

        if (id) {
            fetchBasicInfo();
        } else {
            console.log('[CourseDetail] No course ID provided');
            setIsLoading(false);
        }
    }, [id]);

    // fetch feedback
    useEffect(() => {
        const fetchInitialFeedbacks = async () => {
            if (!id) return;

            setIsLoadingFeedbacks(true);
            try {
                console.log('[CourseDetail] Starting to fetch initial feedbacks');
                const data = await getCourseFeedbacks(Number(id), 1);

                if (data) {
                    setFeedbacks(data.items);
                    setFeedbackMeta({
                        total: data.total,
                        currentPage: 2, // Set to next page
                        hasMore: data.hasMore
                    });
                    console.log('[CourseDetail] Successfully loaded initial feedbacks');
                } else {
                    console.log('[CourseDetail] No feedbacks found');
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
            console.log(`[CourseDetail] Loading more feedbacks, page: ${feedbackMeta.currentPage}`);
            const data = await getCourseFeedbacks(Number(id), feedbackMeta.currentPage);
            if (data) {
                setFeedbacks(prev => [...prev, ...data.items]);
                setFeedbackMeta({
                    total: data.total,
                    currentPage: feedbackMeta.currentPage + 1,
                    hasMore: data.hasMore
                });
                console.log('[CourseDetail] Successfully loaded more feedbacks');
            }
        } catch (error) {
            console.error('[CourseDetail] Error loading more feedbacks:', error);
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };

    // Fetch curriculum when switching to content tab
    const fetchCurriculum = async (courseId: number) => {
        try {
            setIsLoadingCurriculum(true);
            const data = await getCourseCurriculum(courseId);
            setCurriculum(data);
            console.log('[CourseDetail] Successfully fetched curriculum:', data);
            return data; // Return data để sử dụng ngay
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
            console.log(`[CourseDetail] Fetching feedbacks for page ${page}`);
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

            await requestPostWithAuth<void>(
                '/course/feedback',
                feedbackData
            );

            // Refresh feedback list after successful submission
            const data = await fetchFeedbacks(Number(id), 1);

            if (data) {
                setFeedbacks(data.items);
                setFeedbackMeta({
                    total: data.total,
                    currentPage: 2, // Set to next page
                    hasMore: data.hasMore
                });
                showNotification(
                    'success',
                    'Thành công',
                    'Đánh giá của bạn đã được gửi thành công'
                );
            } else {
                console.log('[CourseDetail] No feedbacks found');
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

    // start learning
    const findNextLesson = (chapters: Chapter[]): {
        chapterId: number;
        lessonId: number;
        type: string;
    } | null => {
        // Duyệt qua từng chapter
        for (const chapter of chapters) {
            // Duyệt qua từng lesson trong chapter
            for (let i = 0; i < chapter.lessons.length; i++) {
                const currentLesson = chapter.lessons[i];

                // Nếu là bài học đầu tiên chưa hoàn thành hoặc null
                if (!currentLesson.progress || currentLesson.progress.status !== 'completed') {
                    return {
                        chapterId: chapter.id,
                        lessonId: currentLesson.id,
                        type: currentLesson.type
                    };
                }

                // Nếu là bài học cuối cùng đã hoàn thành trong chapter
                if (currentLesson.progress?.status === 'completed' &&
                    i === chapter.lessons.length - 1) {
                    // Kiểm tra chapter tiếp theo
                    continue;
                }

                // Nếu bài hiện tại đã hoàn thành, kiểm tra bài tiếp theo
                if (currentLesson.progress?.status === 'completed' &&
                    i < chapter.lessons.length - 1) {
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

        // Nếu không tìm thấy bài chưa hoàn thành, trả về bài đầu tiên
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
        // Kiểm tra đã enroll chưa
        if (!isEnrolled) return;

        const nextLesson = findNextLesson(chapters);

        if (nextLesson) {
            const path = getLessonPath(
                courseId,
                nextLesson.chapterId,
                nextLesson.lessonId,
                nextLesson.type
            );
            navigate(path);
        } else {
            console.warn('No lessons found in the course');
        }
    };

    const handleStartLearningClick = async () => {
        if (!id) return;

        let currentCurriculum = curriculum;

        // Nếu chưa có curriculum thì fetch
        if (!currentCurriculum) {
            const fetchedData = await fetchCurriculum(Number(id));
            if (!fetchedData) return; // Nếu fetch thất bại thì return
            currentCurriculum = fetchedData;
        }

        // Kiểm tra và thực hiện navigate
        if (currentCurriculum?.chapters) {
            handleStartLearning(
                Number(id),
                (basicInfo?.enrolled ? basicInfo.enrolled : false),
                currentCurriculum.chapters,
                navigate
            );
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
            <CourseHero
                courseData={basicInfo}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onStartLearning={handleStartLearningClick}
            />
            <div className="container mx-auto px-4 py-8">
                <div className="flex space-x-8">
                    <div className="w-2/3">
                        {/* Tabs */}
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

                        {/* Tab Content */}
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
                                    chapters={curriculum.chapters}
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
                            onBuyNow={handleBuyNow}
                            onStartLearning={handleStartLearningClick}
                        />
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};

export default CourseDetail;