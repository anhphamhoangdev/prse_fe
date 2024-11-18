import React, {useEffect, useState} from 'react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import {CourseSidebar} from "../../components/course/course-detail/CourseSidebar";
import {CourseContent} from "../../components/course/course-detail/CourseContent";
import {CourseHero} from "../../components/course/course-detail/CourseHero";
import {CourseOverview} from "../../components/course/course-detail/CourseOverview";
import {CourseBasicDTO, CourseCurriculumDTO, FeedbackData} from "../../types/course";
import {useParams} from "react-router-dom";
import {getBasicDetailCourse, getCourseFeedbacks} from "../../services/courseService";
import {CourseNotFound} from "../../components/course/course-detail/CourseNotFound";

interface FeedbackPages {
    [key: string]: FeedbackData[];  // index signature
}

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

const handleStartLearning = () => {
    // Có thể chuyển hướng người dùng đến trang học
    console.log('Starting course...');
    // router.push(`/learn/${courseData.id}`);
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

    const { id } = useParams<{ id: string }>();

    // STATE
    const [basicInfo, setBasicInfo] = useState<CourseBasicDTO | null>({
        id: 1,
        title: "Huỷ diệt Java Spring Boot",
        description: "Làm quen với lập trình Back-end bằng Spring Boot từ cơ bản đến nâng cao. Xây dựng RESTful API, xử lý bất đồng bộ, tối ưu hiệu suất và triển khai ứng dụng thực tế.",
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

    const [curriculum, setCurriculum] = useState<CourseCurriculumDTO>({
        chapters: [
            {
                id: 1,
                title: "Giới thiệu Spring Boot",
                progress: {
                    status: 'completed',
                    completedAt: '2024-03-14T10:30:00',
                    progressPercent: 100
                },
                lessons: [
                    {
                        id: 1,
                        title: "Tổng quan về Spring Boot",
                        type: "video",
                        duration: "15:00",
                        progress: {
                            status: 'completed',
                            completedAt: '2024-03-12T15:30:00',
                            lastAccessedAt: '2024-03-12T16:45:00'
                        }
                    },
                    {
                        id: 2,
                        title: "Cài đặt môi trường phát triển",
                        type: "text",
                        duration: "15:00",
                        progress: {
                            status: 'completed',
                            completedAt: '2024-03-13T09:20:00',
                            lastAccessedAt: '2024-03-13T10:15:00'
                        }
                    },
                    {
                        id: 3,
                        title: "Kiểm tra kiến thức Spring Boot cơ bản",
                        type: "quiz",
                        duration: "14:00",
                        progress: {
                            status: 'completed',
                            completedAt: '2024-03-14T10:30:00',
                            lastAccessedAt: '2024-03-14T11:00:00'
                        }
                    }
                ]
            },
            {
                id: 2,
                title: "RESTful API với Spring Boot",
                progress: {
                    status: 'in_progress',
                    progressPercent: 33.33
                },
                lessons: [
                    {
                        id: 4,
                        title: "REST Controller và Request Mapping",
                        type: "video",
                        duration: "20:00",
                        progress: {
                            status: 'completed',
                            completedAt: '2024-03-15T14:20:00',
                            lastAccessedAt: '2024-03-15T15:00:00'
                        }
                    },
                    {
                        id: 5,
                        title: "Xử lý Request và Response",
                        type: "code",
                        duration: "3:00",
                        progress: {
                            status: 'not_started',
                        }
                    },
                    {
                        id: 6,
                        title: "Validation và Exception Handling",
                        type: "text",
                        duration: "3:00",
                        progress: {
                            status: 'not_started'
                        }
                    }
                ]
            },
            {
                id: 3,
                title: "Spring Data JPA & Database",
                progress: {
                    status: 'not_started',
                    progressPercent: 0
                },
                lessons: [
                    {
                        id: 7,
                        title: "Giới thiệu về Spring Data JPA",
                        type: "video",
                        duration: "25:00",
                        progress: {
                            status: 'not_started'
                        }
                    },
                    {
                        id: 8,
                        title: "Làm việc với Repository",
                        type: "text",
                        duration: "15:00",
                        progress: {
                            status: 'not_started'
                        }
                    }
                ]
            }
        ]
    });

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
    // useEffect(() => {
    //     const fetchCurriculum = async () => {
    //         if (activeTab === 'content' && !curriculum && id) {
    //             try {
    //                 const data = await courseService.getCourseCurriculum(Number(id));
    //                 setCurriculum(data);
    //             } catch (error) {
    //                 console.error('Failed to fetch curriculum:', error);
    //             }
    //         }
    //     };
    //
    //     fetchCurriculum();
    // }, [activeTab, curriculum, id]);

    const handleSubmitFeedback = async (rating: number, comment: string) => {
        if (!id) return;

        try {
            // await courseService.submitFeedback(Number(id), rating, comment);
            // Reload feedbacks after submission
            // const data = await courseService.getCourseFeedbacks(Number(id), 1);
            // setFeedbacks(data.items);
            // setFeedbackMeta({
            //     total: data.total,
            //     page: 2,
            //     hasMore: data.hasMore
            // });
        } catch (error) {
            console.error('Failed to submit feedback:', error);
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
                onStartLearning={handleStartLearning}
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
                            curriculum && (
                                <CourseContent
                                    chapters={curriculum.chapters}
                                    expandedChapters={expandedChapters}
                                    setExpandedChapters={setExpandedChapters}
                                    isEnrolled={basicInfo.enrolled}
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
                            onStartLearning={handleStartLearning}
                        />
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};

export default CourseDetail;