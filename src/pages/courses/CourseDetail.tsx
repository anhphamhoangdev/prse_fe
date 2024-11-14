import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Play, FileText, Code, BookOpen, Clock, Users, Globe, Star } from 'lucide-react';
import { SearchHeaderAndFooterLayout } from '../../layouts/UserLayout';

interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'text' | 'code' | 'quiz';
    duration?: string;
}

interface Chapter {
    id: number;
    title: string;
    lessons: Lesson[];
}

interface CourseData {
    id: number;
    title: string;
    description: string;
    instructor: string;
    totalStudents: number;
    language: string;
    rating: number;
    price: number;
    thumbnail: string;
    totalDuration: string;
    lastUpdated: string;
    chapters: Chapter[];
}

const CourseDetail: React.FC = () => {
    const courseData: CourseData = {
        id: 1,
        title: "Complete Web Development Bootcamp",
        description: "Learn web development from scratch to advanced level with practical projects and real-world examples. Master HTML, CSS, JavaScript, React and more.",
        instructor: "John Doe",
        totalStudents: 1500,
        language: "English",
        rating: 4.8,
        price: 99.99,
        thumbnail: "/api/placeholder/800/400",
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
        ]
    };

    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');

    const getLessonIcon = (type: Lesson['type']): JSX.Element => {
        switch (type) {
            case 'video':
                return <Play className="w-4 h-4" />;
            case 'text':
                return <FileText className="w-4 h-4" />;
            case 'code':
                return <Code className="w-4 h-4" />;
            case 'quiz':
                return <BookOpen className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <SearchHeaderAndFooterLayout>
            {/* Hero Section */}
            <div className="bg-gray-900 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="text-blue-400 text-sm mb-2">Web Development</div>
                            <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
                            <p className="text-gray-300 mb-6">{courseData.description}</p>
                            <div className="flex items-center space-x-6 text-sm mb-8">
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    {courseData.totalStudents.toLocaleString()} students
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {courseData.totalDuration}
                                </div>
                                <div className="flex items-center">
                                    <Globe className="w-4 h-4 mr-2" />
                                    {courseData.language}
                                </div>
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 mr-2" />
                                    {courseData.rating}
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                    Enroll Now - ${courseData.price}
                                </button>
                                <p className="text-sm text-gray-400">Last updated: {courseData.lastUpdated}</p>
                            </div>
                        </div>
                        <div>
                            <img
                                src={courseData.thumbnail}
                                alt="Course Preview"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex space-x-8">
                    {/* Left Content */}
                    <div className="w-2/3">
                        {/* Tabs */}
                        <div className="border-b mb-6">
                            <div className="flex space-x-8">
                                <button
                                    className={`pb-4 px-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    Overview
                                </button>
                                <button
                                    className={`pb-4 px-2 ${activeTab === 'content' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                                    onClick={() => setActiveTab('content')}
                                >
                                    Course Content
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' ? (
                            <div className="space-y-6">
                                <section>
                                    <h2 className="text-xl font-semibold mb-4">What you'll learn</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-start space-x-2">
                                            <div className="text-green-500">✓</div>
                                            <p>Build modern responsive websites</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="text-green-500">✓</div>
                                            <p>Master HTML5, CSS3, and JavaScript</p>
                                        </div>
                                        {/* Add more learning points */}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Basic computer knowledge</li>
                                        <li>No programming experience required</li>
                                    </ul>
                                </section>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {courseData.chapters.map(chapter => (
                                    <div key={chapter.id} className="bg-white rounded-lg border">
                                        <button
                                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                                            onClick={() => setExpandedChapters(prev => ({
                                                ...prev,
                                                [chapter.id]: !prev[chapter.id]
                                            }))}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{chapter.title}</span>
                                                <span className="text-sm text-gray-500">
                                                    ({chapter.lessons.length} lessons)
                                                </span>
                                            </div>
                                            {expandedChapters[chapter.id] ?
                                                <ChevronUp className="w-5 h-5" /> :
                                                <ChevronDown className="w-5 h-5" />
                                            }
                                        </button>

                                        {expandedChapters[chapter.id] && (
                                            <div className="border-t">
                                                {chapter.lessons.map(lesson => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center space-x-3 p-4 hover:bg-gray-50"
                                                    >
                                                        <span className="p-2 bg-gray-100 rounded-lg">
                                                            {getLessonIcon(lesson.type)}
                                                        </span>
                                                        <span className="flex-grow">{lesson.title}</span>
                                                        {lesson.duration && (
                                                            <span className="text-sm text-gray-500">
                                                                {lesson.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-1/3">
                        <div className="bg-white rounded-lg border p-6 sticky top-4">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">This course includes:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center space-x-3">
                                            <Play className="w-4 h-4" />
                                            <span>{courseData.totalDuration} of video content</span>
                                        </li>
                                        <li className="flex items-center space-x-3">
                                            <FileText className="w-4 h-4" />
                                            <span>Downloadable resources</span>
                                        </li>
                                        <li className="flex items-center space-x-3">
                                            <Code className="w-4 h-4" />
                                            <span>Coding exercises</span>
                                        </li>
                                        <li className="flex items-center space-x-3">
                                            <BookOpen className="w-4 h-4" />
                                            <span>Full lifetime access</span>
                                        </li>
                                    </ul>
                                </div>
                                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                    Enroll Now
                                </button>
                                <p className="text-sm text-center text-gray-500">
                                    30-day money-back guarantee
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};

export default CourseDetail;