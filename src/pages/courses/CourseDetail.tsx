import React, { useState } from 'react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import {CourseSidebar} from "../../components/course/course-detail/CourseSidebar";
import {CourseContent} from "../../components/course/course-detail/CourseContent";
import {CourseHero} from "../../components/course/course-detail/CourseHero";
import {CourseOverview} from "../../components/course/course-detail/CourseOverview";
import {CourseBasicDTO, CourseCurriculumDTO, FeedbackData} from "../../types/course";
import {useParams} from "react-router-dom";

interface FeedbackPages {
    [key: string]: FeedbackData[];  // index signature
}
const mockFeedbackPages: FeedbackPages = {
    page1: [
        {
            id: 1,
            studentId: 1,
            studentName: "Anh Long",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/433129123_385482517594012_376337141649238004_n.jpg",
            rating: 5,
            comment: "Học Spring Boot xong, giờ tôi là bậc thầy của @Autowired! Dependency Injection giờ đây chỉ là chuyện nhỏ như con thỏ. Bean của tôi mọc lên tươi tốt như rau trong vườn! 🌱",
            createdAt: "2024-03-15T10:00:00"
        },
        {
            id: 2,
            studentId: 2,
            studentName: "Em Long Huy",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/456583606_1226900268512711_5713235832187306782_n.jpg",
            rating: 4,
            comment: "Ban đầu tưởng Spring Boot khó như leo núi Everest, ai ngờ giảng viên giải thích dễ hiểu đến mức tôi còn code được trong lúc... ăn phở! Giờ REST API với tôi đơn giản như trở bàn tay 🍜",
            createdAt: "2024-03-10T15:30:00"
        },
        {
            id: 3,
            studentId: 3,
            studentName: "Em Long Linh",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-1/434639741_2040379269666782_6839187750192260565_n.jpg",
            rating: 5,
            comment: "Sau khóa học này, tôi đã biết cách làm cho ứng dụng 'nhảy múa' theo ý mình! Spring Security giờ không còn là cơn ác mộng nữa, exception handling đã trở thành người bạn thân thiết. Có thể nói tôi đã từ 'gà mờ' thành 'đại bàng' Java! 🦅",
            createdAt: "2024-03-10T15:30:00"
        }
    ],
    page2: [
        {
            id: 4,
            studentId: 4,
            studentName: "Chị Long Lanh",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/433129123_385482517594012_376337141649238004_n.jpg",
            rating: 5,
            comment: "Tuyệt vời! Khóa học này đã giúp tôi từ zero đến hero trong Spring Boot. Instructor giảng rất chi tiết và dễ hiểu! 🚀",
            createdAt: "2024-03-09T14:20:00"
        },
        {
            id: 5,
            studentId: 5,
            studentName: "Anh Long Lê",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/456583606_1226900268512711_5713235832187306782_n.jpg",
            rating: 4,
            comment: "Spring Boot giờ đã trở thành người bạn thân của tôi. JPA, Security, đều không còn là vấn đề nữa! 💪",
            createdAt: "2024-03-08T16:45:00"
        }
    ],
    page3: [
        {
            id: 6,
            studentId: 6,
            studentName: "Em Long Lê",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-1/434639741_2040379269666782_6839187750192260565_n.jpg",
            rating: 5,
            comment: "Đầu tư vào khóa học này là quyết định đúng đắn nhất của tôi trong năm nay. Kiến thức quá xịn! 🎯",
            createdAt: "2024-03-07T09:15:00"
        }
    ]
};

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
    const [basicInfo, setBasicInfo] = useState<CourseBasicDTO>({
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
        isEnrolled: true,

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
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([
        {
            id: 1,
            studentId: 1,
            studentName: "Anh Long",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/433129123_385482517594012_376337141649238004_n.jpg",
            rating: 5,
            comment: "Học Spring Boot xong, giờ tôi là bậc thầy của @Autowired! Dependency Injection giờ đây chỉ là chuyện nhỏ như con thỏ. Bean của tôi mọc lên tươi tốt như rau trong vườn! 🌱",
            createdAt: "2024-03-15T10:00:00"
        },
        {
            id: 2,
            studentId: 2,
            studentName: "Em Long Huy",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/456583606_1226900268512711_5713235832187306782_n.jpg",
            rating: 4,
            comment: "Ban đầu tưởng Spring Boot khó như leo núi Everest, ai ngờ giảng viên giải thích dễ hiểu đến mức tôi còn code được trong lúc... ăn phở! Giờ REST API với tôi đơn giản như trở bàn tay 🍜",
            createdAt: "2024-03-10T15:30:00"
        },
        {
            id: 3,
            studentId: 3,
            studentName: "Em Long Linh",
            studentAvatarUrl: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-1/434639741_2040379269666782_6839187750192260565_n.jpg",
            rating: 5,
            comment: "Sau khóa học này, tôi đã biết cách làm cho ứng dụng 'nhảy múa' theo ý mình! Spring Security giờ không còn là cơn ác mộng nữa, exception handling đã trở thành người bạn thân thiết. Có thể nói tôi đã từ 'gà mờ' thành 'đại bàng' Java! 🦅",
            createdAt: "2024-03-10T15:30:00"
        }
    ]);

    const [feedbackMeta, setFeedbackMeta] = useState({ total: 3, page: 1, hasMore: true });
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);


    // useEffect(() => {
    //     const fetchBasicInfo = async () => {
    //         setIsLoading(true);
    //         try {
    //             const data = await courseService.getCourseBasic(Number(id));
    //             setBasicInfo(data);
    //         } catch (error) {
    //             console.error('Failed to fetch course info:', error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //
    //     if (id) fetchBasicInfo();
    // }, [id]);

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

    // Load more feedbacks
    const loadMoreFeedbacks = async () => {
        if (!feedbackMeta.hasMore) return;

        setIsLoadingMore(true);
        try {
            // Giả lập API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Lấy data tương ứng với page hiện tại
            const nextPage = feedbackMeta.page;
            const newFeedbacks = mockFeedbackPages[`page${nextPage}`] || [];

            setFeedbacks(prev => [...prev, ...newFeedbacks]);
            setFeedbackMeta({
                total: feedbackMeta.total + newFeedbacks.length,
                page: nextPage + 1,
                hasMore: nextPage < 3 // Có 3 pages
            });
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

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

    if (isLoading || !basicInfo) return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>
    );

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
                                    label="Overview"
                                    onClick={() => setActiveTab('overview')}
                                    isActive={activeTab === 'overview'}
                                />
                                <TabButton
                                    tab="content"
                                    label="Course Content"
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
                            />
                        ) : (
                            curriculum && (
                                <CourseContent
                                    chapters={curriculum.chapters}
                                    expandedChapters={expandedChapters}
                                    setExpandedChapters={setExpandedChapters}
                                    isEnrolled={basicInfo.isEnrolled}
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