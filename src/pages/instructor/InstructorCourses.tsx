import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {InstructorCourse} from "../../types/course";
import {requestWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";
import {CourseRow} from "../../components/instructor/CourseRow";
import {BookOpen} from "lucide-react";

enum TabType {
    PUBLISHED = 'published',
    DRAFT = 'draft'
}

const fakeCourses: InstructorCourse[] = [
    {
        id: 1,
        title: "Học Lập Trình Web Cơ Bản",
        description: "Khóa học này cung cấp kiến thức cơ bản về lập trình web, bao gồm HTML, CSS và JavaScript.",
        shortDescription: "Khóa học lập trình web dành cho người mới bắt đầu.",
        imageUrl: "https://files.fullstack.edu.vn/f8-prod/courses/7.png",
        language: "Tiếng Việt",
        originalPrice: 1500000,
        isDiscount: true,
        isHot: true,
        isPublish: false,
        totalStudents: 200,
        totalViews: 1500,
        averageRating: 4.5,
        previewVideoUrl: "https://example.com/videos/preview-web-development.mp4",
        previewVideoDuration: "01:30",
        createdAt: "2023-01-15T10:00:00Z",
        updatedAt: "2023-10-01T12:00:00Z",
    },
    {
        id: 2,
        title: "Lập Trình Python Nâng Cao",
        description: "Khóa học này giúp bạn phát triển kỹ năng lập trình Python từ cơ bản đến nâng cao.",
        shortDescription: "Khóa học dành cho lập trình viên Python muốn nâng cao kỹ năng.",
        imageUrl: "https://files.fullstack.edu.vn/f8-prod/courses/7.png",
        language: "Tiếng Việt",
        originalPrice: 2000000,
        isDiscount: false,
        isHot: true,
        isPublish: true,
        totalStudents: 150,
        totalViews: 800,
        averageRating: 4.7,
        previewVideoUrl: "https://example.com/videos/preview-python-advanced.mp4",
        previewVideoDuration: "02:00",
        createdAt: "2023-02-20T09:30:00Z",
        updatedAt: "2023-10-01T12:00:00Z",
    },
    {
        id: 3,
        title: "Thiết Kế Giao Diện Người Dùng (UI/UX)",
        description: "Khóa học này sẽ hướng dẫn bạn cách thiết kế giao diện người dùng hấp dẫn và thân thiện.",
        shortDescription: "Khóa học thiết kế UI/UX cho người mới bắt đầu.",
        imageUrl: "https://files.fullstack.edu.vn/f8-prod/courses/7.png",
        language: "Tiếng Việt",
        originalPrice: 1800000,
        isDiscount: true,
        isHot: false,
        isPublish: true,
        totalStudents: 120,
        totalViews: 600,
        averageRating: 4.3,
        previewVideoUrl: "https://example.com/videos/preview-ui-ux-design.mp4",
        previewVideoDuration: "01:45",
        createdAt: "2023-03-10T11:00:00Z",
        updatedAt: "2023-10-01T12:00:00Z",
    },
];

const InstructorCourses: React.FC = () => {
    const [courses, setCourses] = useState<InstructorCourse[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>(TabType.PUBLISHED);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // const response = await requestWithAuth(ENDPOINTS.INSTRUCTOR.COURSES);
                // setCourses(response.data || []);
                setCourses(fakeCourses);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        activeTab === TabType.PUBLISHED ? course.isPublish : !course.isPublish
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header - Keep as is */}
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
                <button
                    onClick={() => navigate('/instructor/upload')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Tạo khóa học mới
                </button>
            </div>

            {/* Enhanced Tabs */}
            <div className="mb-6">
                <div className="flex gap-8">
                    {[
                        { type: TabType.PUBLISHED, label: 'Đã xuất bản', count: courses.filter(c => c.isPublish).length },
                        { type: TabType.DRAFT, label: 'Bản nháp', count: courses.filter(c => !c.isPublish).length }
                    ].map((tab) => (
                        <button
                            key={tab.type}
                            onClick={() => setActiveTab(tab.type)}
                            className={`relative pb-4 px-2 text-sm font-medium border-b-2 transition-colors
                            ${activeTab === tab.type
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Layout for Courses */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {filteredCourses.map(course => (
                        <CourseRow key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {activeTab === TabType.PUBLISHED
                            ? 'Bạn chưa có khóa học nào được xuất bản'
                            : 'Bạn chưa có khóa học nào trong bản nháp'}
                    </p>
                </div>
            )}

            {/* Optional Pagination */}
            {filteredCourses.length > 0 && (
                <div className="mt-6 flex justify-center">
                    {/* Add pagination components if needed */}
                </div>
            )}
        </div>
    );
};

export default InstructorCourses;