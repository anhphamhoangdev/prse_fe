// AdminCourseDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestAdminWithAuth, putAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {
    ArrowLeft,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import {AdminCourseDetailType, ApiResponse} from "../../types/admin";
import CourseInfoTab from "../../components/admin/CourseInfoTab";
import ChaptersTab from "../../components/admin/ChaptersTab";
import StudentsTab from "../../components/admin/StudentsTab";


const AdminCourseDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const descriptionRef = useRef<HTMLDivElement>(null);

    // Tab management
    const [activeTab, setActiveTab] = useState('info');

    // Course data state
    const [courseDetail, setCourseDetail] = useState<AdminCourseDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Publish state
    const [isPublish, setIsPublish] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch course data
    useEffect(() => {
        const fetchCourseDetail = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                const response = await requestAdminWithAuth<ApiResponse>(`${ENDPOINTS.ADMIN.COURSES}/${id}/detail`);

                if (response && response.courseDetail) {
                    setCourseDetail(response.courseDetail);
                    setIsPublish(response.courseDetail.isPublish);
                } else {
                    setError('Không thể tải thông tin khóa học');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin khóa học');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetail();
    }, [id]);

    // Highlight code blocks using Prism.js
    useEffect(() => {
        if (courseDetail) {
            Prism.highlightAll();
        }
    }, [courseDetail]);

    // Handle publish toggle
    const handlePublishToggle = async () => {
        if (!id || !courseDetail) return;

        setIsSaving(true);
        setSuccessMessage(null);
        setError(null);

        try {
            await putAdminWithAuth(`${ENDPOINTS.ADMIN.COURSES}/${id}/updatePubish`, {});

            setIsPublish(!isPublish);
            setSuccessMessage(`Khóa học đã được ${!isPublish ? 'xuất bản' : 'hủy xuất bản'} thành công`);

            // Refresh course data
            const updatedResponse = await requestAdminWithAuth<ApiResponse>(`${ENDPOINTS.ADMIN.COURSES}/${id}/detail`);
            if (updatedResponse && updatedResponse.courseDetail) {
                setCourseDetail(updatedResponse.courseDetail);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật trạng thái xuất bản');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <div className="text-red-600 text-center py-8">{error}</div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/admin/courses')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách khóa học
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!courseDetail) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <div className="text-red-600 text-center py-8">Không tìm thấy thông tin khóa học</div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/admin/courses')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách khóa học
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white shadow-lg rounded-lg p-8">
                {/* Header */}
                <CourseHeader
                    courseDetail={courseDetail}
                    isPublish={isPublish}
                    isSaving={isSaving}
                    handlePublishToggle={handlePublishToggle}
                    navigate={navigate}
                />

                {/* Success message */}
                {successMessage && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                {/* Status indicator */}
                <CourseStatus courseDetail={courseDetail} />

                {/* Tab navigation */}
                <TabNavigation
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Tab content */}
                {activeTab === 'info' && (
                    <CourseInfoTab
                        courseDetail={courseDetail}
                        descriptionRef={descriptionRef}
                        isPublish={isPublish}
                        isSaving={isSaving}
                        handlePublishToggle={handlePublishToggle}
                        navigate={navigate}
                    />
                )}

                {activeTab === 'chapters' && (
                    <ChaptersTab
                        courseId={id || ''}
                        setSuccessMessage={setSuccessMessage}
                        setError={setError}
                    />
                )}

                {activeTab === 'students' && (
                    <StudentsTab
                        courseId={id || ''}
                        setSuccessMessage={setSuccessMessage}
                        setError={setError}
                    />
                )}
            </div>
        </div>
    );
};

interface CourseHeaderProps {
    courseDetail: AdminCourseDetailType;
    isPublish: boolean;
    isSaving: boolean;
    handlePublishToggle: () => Promise<void>;
    navigate: ReturnType<typeof useNavigate>;
}

const CourseHeader = ({ courseDetail, isPublish, isSaving, handlePublishToggle, navigate }: CourseHeaderProps) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Chi tiết khóa học</h1>
            </div>

            <div className="flex items-center gap-3">
                <a
                    href={`https://prse-fe.vercel.app/course-detail/${courseDetail.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                    <Eye className="w-4 h-4" />
                    Xem trang khóa học
                </a>

                <button
                    type="button"
                    onClick={handlePublishToggle}
                    disabled={isSaving}
                    className={`px-4 py-2 ${
                        isPublish
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                    } rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        isSaving ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                    {isSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : isPublish ? (
                        <XCircle className="w-4 h-4" />
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                    {isSaving
                        ? 'Đang cập nhật...'
                        : isPublish
                            ? 'Tắt xuất bản'
                            : 'Xuất bản'
                    }
                </button>
            </div>
        </div>
    );
};

interface CourseStatusProps {
    courseDetail: AdminCourseDetailType;
}

const CourseStatus = ({ courseDetail }: CourseStatusProps) => {
    return (
        <div className="mb-6 flex gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                courseDetail.isPublish ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
                {courseDetail.isPublish ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                )}
                {courseDetail.isPublish ? 'Đã xuất bản' : 'Chưa xuất bản'}
            </span>

            {courseDetail.isHot && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    Nổi bật
                </span>
            )}

            {courseDetail.isDiscount && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Giảm giá
                </span>
            )}
        </div>
    );
};

interface TabNavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'info'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Thông tin khóa học
                </button>
                <button
                    onClick={() => setActiveTab('chapters')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'chapters'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Chương và bài học
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'students'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Học viên trong khoá
                </button>
            </nav>
        </div>
    );
};

export default AdminCourseDetail;