import React, { useState } from 'react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';
import {CourseSidebar} from "../../components/course/course-detail/CourseSidebar";
import {CourseContent} from "../../components/course/course-detail/CourseContent";
import {CourseHero} from "../../components/course/course-detail/CourseHero";
import {CourseOverview} from "../../components/course/course-detail/CourseOverview";
import {CourseDetailData} from "../../types/course";


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

const handleSubmitFeedback = (rating: number, comment: string) => {
    console.log('Submitting feedback:', { rating, comment });
    // Implement API call to submit feedback
};

const CourseDetail: React.FC = () => {
    const courseData: CourseDetailData = {
        "id": 1,
        "title": "Huỷ diệt Java Spring Boot",
        "description": "Làm quen với lập trình Back-end bằng Spring Boot từ cơ bản đến nâng cao. Xây dựng RESTful API, xử lý bất đồng bộ, tối ưu hiệu suất và triển khai ứng dụng thực tế.",
        "totalStudents": 1500,
        "totalViews": 5000,
        "language": "Tiếng Việt",
        "averageRating": 4.8,
        "originalPrice": 300000,
        "discountPrice": 300000,
        "imageUrl": "https://files.fullstack.edu.vn/f8-prod/courses/7.png",
        "totalDuration": "45 giờ",
        "lastUpdated": "Tháng 3 2024",
        "previewVideoUrl": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "previewVideoDuration": 596,
        "isEnrolled": false,

        "instructor": {
            "id": 1,
            "fullName": "John Doe",
            "avatarUrl": "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-1/416238737_2395657973950734_3403316050107008880_n.jpg",
            "title": "Senior Java Developer & Instructor",
            "totalCourses": 8,
            "totalStudents": 35000
        },

        "chapters": [
            {
                "id": 1,
                "title": "Giới thiệu Spring Boot",
                "lessons": [
                    {
                        "id": 1,
                        "title": "Tổng quan về Spring Boot",
                        "type": "video",
                        "duration": "15:00"
                    },
                    {
                        "id": 2,
                        "title": "Cài đặt môi trường phát triển",
                        "type": "text"
                    },
                    {
                        "id": 3,
                        "title": "Kiểm tra kiến thức Spring Boot cơ bản",
                        "type": "quiz"
                    }
                ]
            },
            {
                "id": 2,
                "title": "RESTful API với Spring Boot",
                "lessons": [
                    {
                        "id": 4,
                        "title": "REST Controller và Request Mapping",
                        "type": "video",
                        "duration": "20:00"
                    },
                    {
                        "id": 5,
                        "title": "Xử lý Request và Response",
                        "type": "code"
                    },
                    {
                        "id": 6,
                        "title": "Validation và Exception Handling",
                        "type": "text"
                    }
                ]
            }
        ],

        "learningPoints": [
            {
                "id": 1,
                "content": "Xây dựng ứng dụng web với Spring Boot từ A-Z"
            },
            {
                "id": 2,
                "content": "Thiết kế và phát triển RESTful API chuẩn"
            },
            {
                "id": 3,
                "content": "Làm việc với cơ sở dữ liệu sử dụng Spring Data JPA"
            },
            {
                "id": 4,
                "content": "Xử lý bất đồng bộ và tối ưu hiệu suất"
            },
            {
                "id": 5,
                "content": "Bảo mật ứng dụng với Spring Security"
            },
            {
                "id": 6,
                "content": "Triển khai ứng dụng lên môi trường production"
            }
        ],

        "prerequisites": [
            {
                "id": 1,
                "content": "Kiến thức cơ bản về Java"
            },
            {
                "id": 2,
                "content": "Hiểu biết về lập trình hướng đối tượng (OOP)"
            },
            {
                "id": 3,
                "content": "Cơ bản về HTML, SQL và RESTful API"
            },
        ],

        "feedbacks": [
            {
                "id": 1,
                "studentId": 1,
                "studentName": "Anh Long",
                "studentAvatarUrl": "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/433129123_385482517594012_376337141649238004_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=C5wAqfqjZGIQ7kNvgHpVV8R&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=A0sW7sTsX-ZrRlCLmZ2z5ev&oh=00_AYA2G5foZuP4NOjkL-QWPelwBF9dtVp-1JVKr-EREyXe0A&oe=673C97D7",
                "rating": 5,
                "comment": "Học Spring Boot xong, giờ tôi là bậc thầy của @Autowired! Dependency Injection giờ đây chỉ là chuyện nhỏ như con thỏ. Bean của tôi mọc lên tươi tốt như rau trong vườn! 🌱",
                "createdAt": "2024-03-15T10:00:00Z"
            },
            {
                "id": 2,
                "studentId": 2,
                "studentName": "Em Long Huy",
                "studentAvatarUrl": "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/456583606_1226900268512711_5713235832187306782_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=tzxXAdK8Mk8Q7kNvgGLAMZz&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=AuezSaY9cLuF4IIi3Pzcey-&oh=00_AYDZzsyXDZILyK-BaDtP0f94huSNCi-zZnevmayTopg3Og&oe=673C8733",
                "rating": 4,
                "comment": "Ban đầu tưởng Spring Boot khó như leo núi Everest, ai ngờ giảng viên giải thích dễ hiểu đến mức tôi còn code được trong lúc... ăn phở! Giờ REST API với tôi đơn giản như trở bàn tay 🍜",
                "createdAt": "2024-03-10T15:30:00Z"
            },
            {
                "id": 3,
                "studentId": 3,
                "studentName": "Em Long Linh",
                "studentAvatarUrl": "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-1/434639741_2040379269666782_6839187750192260565_n.jpg?stp=dst-jpg_s480x480&_nc_cat=110&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=wCZCv4xKCRsQ7kNvgH0x2f_&_nc_zt=24&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=ARz2Oi5wMPMR1u_1Utw63MB&oh=00_AYDF4QY4dwkUNrPYRc2jXEYvUHQaKqhXH_bQq6ka3f04pQ&oe=673C8507",
                "rating": 5,
                "comment": "Sau khóa học này, tôi đã biết cách làm cho ứng dụng 'nhảy múa' theo ý mình! Spring Security giờ không còn là cơn ác mộng nữa, exception handling đã trở thành người bạn thân thiết. Có thể nói tôi đã từ 'gà mờ' thành 'đại bàng' Java! 🦅",
                "createdAt": "2024-03-10T15:30:00Z"
            }
        ],
        subcategories: [
            {
                "id": 1,
                "subcategoryName": "Java Spring Boot"
            },
            {
                "id": 2,
                "subcategoryName": "Back-end Development"
            },
            {
                "id": 1,
                "subcategoryName": "Java Spring Boot"
            }
        ]
    };

    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');

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

    return (
        <SearchHeaderAndFooterLayout>
            <CourseHero
                courseData={courseData}
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
                                courseData={courseData}
                                onSubmitFeedback={handleSubmitFeedback}
                            />                        ) : (
                            <CourseContent
                                chapters={courseData.chapters}
                                expandedChapters={expandedChapters}
                                setExpandedChapters={setExpandedChapters}
                            />
                        )}
                    </div>

                    <div className="w-1/3">
                        <CourseSidebar
                            courseData={courseData}
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