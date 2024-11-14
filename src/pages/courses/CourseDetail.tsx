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
        id: 1,
        title: "Complete Web Development Bootcamp",
        description: "Learn web development from scratch to advanced level with practical projects and real-world examples. Master HTML, CSS, JavaScript, React and more.",
        instructor: {
            id: 1,
            name: "John Doe",
            avatar: "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-1/416238737_2395657973950734_3403316050107008880_n.jpg?stp=cp6_dst-jpg_s480x480&_nc_cat=107&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=DRCU1GspZYIQ7kNvgFV3wMg&_nc_zt=24&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=ADNDDwPCVl9NSCcrQR1yGj-&oh=00_AYB7RTb5xd5UNDCaGaLuXTZtZfbtrX7EQuBUwiUV1rPHvg&oe=673BD3B6",
            title: "Senior Web Developer & Instructor",
            totalCourses: 12,
            totalStudents: 50000
        },
        isEnrolled: false,
        totalStudents: 1500,
        language: "English",
        rating: 4.8,
        price: 99.99,
        thumbnail: "https://files.fullstack.edu.vn/f8-prod/courses/7.png",
        totalDuration: "32 hours",
        lastUpdated: "September 2023",
        chapters: [
            {
                id: 1,
                title: "Getting Started",
                lessons: [
                    { id: 1, title: "Course Introduction", type: "video", duration: "10:00" },
                    { id: 2, title: "Setting Up Environment", type: "text" },
                    { id: 3, title: "Basic HTML Quiz", type: "quiz" }
                ]
            },
            {
                id: 2,
                title: "HTML & CSS Basics",
                lessons: [
                    { id: 4, title: "HTML Structure", type: "video", duration: "15:00" },
                    { id: 5, title: "CSS Styling", type: "code" },
                    { id: 6, title: "Responsive Design", type: "text" }
                ]
            }
        ],
        learningPoints: [
            {
                id: 1,
                content: "Build modern responsive websites"
            },
            {
                id: 2,
                content: "Master HTML5, CSS3, and JavaScript"
            },
            {
                id: 3,
                content: "Learn React and modern frontend development"
            },
            {
                id: 4,
                content: "Build real-world projects from scratch"
            },
            {
                id: 5,
                content: "Understand web development best practices"
            },
            {
                id: 6,
                content: "Deploy websites to production"
            }
        ],
        prerequisites: [
            {
                id: 1,
                content: "Basic computer knowledge"
            },
            {
                id: 2,
                content: "No programming experience required"
            },
            {
                id: 3,
                content: "A computer with internet connection"
            }
        ],
        previewVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        feedbacks: [
            {
                id: 1,
                userId: 1,
                userName: "Sarah Johnson",
                userAvatar: "https://example.com/avatar1.jpg",
                rating: 5,
                comment: "This course is exactly what I needed to start my web development journey. The instructor explains everything clearly and the projects are very practical.",
                createdAt: "2024-03-15T10:00:00Z"
            },
            {
                id: 2,
                userId: 2,
                userName: "Michael Chen",
                userAvatar: "https://example.com/avatar2.jpg",
                rating: 4,
                comment: "Great course content and structure. Would love to see more advanced topics covered in future updates.",
                createdAt: "2024-03-10T15:30:00Z"
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