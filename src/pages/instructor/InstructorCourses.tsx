import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {InstructorCourse} from "../../types/course";
import {requestWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";
import {CourseRow} from "../../components/instructor/CourseRow";
import {BookOpen} from "lucide-react";
import {Pagination} from "../../components/common/Pagination";

enum TabType {
    PUBLISHED = 'published',
    DRAFT = 'draft'
}

interface InstructorCoursesResponse {
    courses: InstructorCourse[];
}

const InstructorCourses: React.FC = () => {
    const [courses, setCourses] = useState<InstructorCourse[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>(TabType.PUBLISHED);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredCourses = courses.filter(course =>
        activeTab === TabType.PUBLISHED ? course.isPublish : !course.isPublish
    );
    const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };



    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await requestWithAuth<InstructorCoursesResponse>(ENDPOINTS.INSTRUCTOR.COURSES);
                // setCourses(response.data || []);
                setCourses(response.courses || []);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);



    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
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
            <div className="mb-1">
                <div className="flex gap-8">
                    {[
                        { type: TabType.PUBLISHED, label: 'Đã xuất bản', count: courses.filter(c => c.isPublish).length },
                        { type: TabType.DRAFT, label: 'Bản nháp', count: courses.filter(c => !c.isPublish).length }
                    ].map((tab) => (
                        <button
                            key={tab.type}
                            onClick={() => {
                                setActiveTab(tab.type);
                                setCurrentPage(1); // Reset về trang 1 khi chuyển tab
                            }}
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

            {/* Pagination Top */}
            {totalPages > 1 && (
                <div className="mb-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCourses.length) + ' '}
                        trong tổng số {filteredCourses.length} khóa học
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        maxButtons={5}
                    />
                </div>
            )}


            {/* Grid Layout for Courses */}
            {filteredCourses.length > 0 ? (
                <>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {currentCourses.map(course => (
                            <CourseRow key={course.id} course={course} />
                        ))}
                    </div>

                    {/*/!* Pagination *!/*/}
                    {/*{totalPages > 1 && (*/}
                    {/*    <div className="mt-6">*/}
                    {/*        <Pagination*/}
                    {/*            currentPage={currentPage}*/}
                    {/*            totalPages={totalPages}*/}
                    {/*            onPageChange={handlePageChange}*/}
                    {/*            maxButtons={5}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* Hiển thị thông tin về số lượng */}
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCourses.length)}{' '}
                        trong tổng số {filteredCourses.length} khóa học
                    </div>
                </>
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
        </div>
    );
};

export default InstructorCourses;