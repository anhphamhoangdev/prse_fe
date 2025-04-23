import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Upload, Check, X, Info, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useInstructor } from '../../layouts/InstructorLayout';
import { useNotification } from '../../components/notification/NotificationProvider';
import { AutocompleteInput } from '../../components/common/AutocompleteInput';
import { requestWithAuth, requestPostWithAuth, putWithAuth, requestPostFormDataWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { Alert } from '../../components/common/Alert';
import { InstructorData } from "../../types/users";

// File upload configuration
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Format date helper
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

interface InstructorResponse {
    instructor: InstructorData;
}

interface UploadAvatarResponse {
    avatarUrl: string | null;
}

// File upload info component
const FileUploadInfo = () => (
    <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center mb-2">
            <Info className="w-4 h-4 mr-2 text-blue-500" />
            <h4 className="font-semibold">Điều kiện upload ảnh:</h4>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Kích thước tối đa: 1MB</li>
            <li>Định dạng cho phép: JPG, PNG, WEBP</li>
            <li>Ảnh nên có tỷ lệ 1:1 để hiển thị tốt nhất</li>
        </ul>
    </div>
);

// Profile tips component
const ProfileTips = ({ isOpen, toggleOpen }: { isOpen: boolean; toggleOpen: () => void }) => (
    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <button
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
            onClick={toggleOpen}
        >
            <div className="flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                <span>Mẹo tối ưu hóa hồ sơ giảng viên</span>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>
        {isOpen && (
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1 pl-4 animate-fadeIn">
                <li><strong>Tên:</strong> Sử dụng tên đầy đủ, chuyên nghiệp để học viên dễ nhận diện.</li>
                <li><strong>Chức danh:</strong> Chọn chức danh cụ thể (ví dụ: "Senior Java Developer") để thu hút học viên phù hợp.</li>
                <li><strong>Ảnh đại diện:</strong> Chọn ảnh rõ nét, khuôn mặt dễ nhìn, nền đơn giản để tạo ấn tượng tốt.</li>
            </ul>
        )}
    </div>
);

export const InstructorProfile: React.FC = () => {
    const { instructor, setInstructor } = useInstructor();
    const { showNotification } = useNotification();

    // States
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', title: '' });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [avatarChanged, setAvatarChanged] = useState(false);
    const [prevAvatar, setPrevAvatar] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showUploadInfo, setShowUploadInfo] = useState(false);
    const [error, setError] = useState('');
    const [showProfileTips, setShowProfileTips] = useState(true);

    // Initialize data when instructor changes
    useEffect(() => {
        if (instructor) {
            setFormData({
                fullName: instructor.fullName,
                title: instructor.title || '',
            });
            setAvatarUrl(instructor.avatarUrl);
        }
    }, [instructor]);

    // Fetch instructor profile on mount
    useEffect(() => {
        fetchInstructorProfile();
    }, []);

    const fetchInstructorProfile = async () => {
        try {
            setLoading(true);
            const response = await requestWithAuth<InstructorResponse>(ENDPOINTS.INSTRUCTOR.PROFILE);
            setInstructor(response.instructor);
            setError('');
        } catch (error) {
            setError('Không thể tải thông tin giảng viên');
            console.error('Error fetching instructor profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // Memoized formatted date
    const formattedCreatedAt = useMemo(
        () => (instructor ? formatDate(instructor.createdAt) : ''),
        [instructor]
    );

    // File validation
    const validateFile = (file: File): boolean => {
        setUploadError('');

        if (file.size > MAX_FILE_SIZE) {
            setUploadError(`Kích thước file (${(file.size / 1024 / 1024).toFixed(2)}MB) vượt quá giới hạn 1MB`);
            return false;
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setUploadError('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc WEBP');
            return false;
        }

        return true;
    };

    // File upload handler
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!validateFile(file)) {
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
        setPrevAvatar(avatarUrl);

        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatarUrl(event.target?.result as string);
            setAvatarChanged(true);
        };
        reader.onerror = () => {
            setUploadError('Có lỗi xảy ra khi đọc file. Vui lòng thử lại.');
            setSelectedFile(null);
            e.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    // Save avatar
    const handleSaveAvatar = async () => {
        if (!selectedFile) {
            setUploadError('Không có file được chọn');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Gọi API để upload ảnh đại diện
            const response = await requestPostFormDataWithAuth<UploadAvatarResponse>(
                ENDPOINTS.INSTRUCTOR.UPDATE_AVATAR,
                formData
            );
            if (response.avatarUrl) {
                setAvatarUrl(response.avatarUrl);
                setInstructor({ ...instructor!, avatarUrl: response.avatarUrl });
                setAvatarChanged(false);
                setPrevAvatar(null);
                setUploadError('');
                showNotification('success', 'Thành công', 'Ảnh đại diện đã được cập nhật');
            } else {
                throw new Error('Không thể cập nhật ảnh đại diện');
            }
        } catch (error) {
            setAvatarUrl(prevAvatar);
            setAvatarChanged(false);
            setPrevAvatar(null);
            setUploadError('Có lỗi xảy ra khi cập nhật ảnh đại diện');
            showNotification('error', 'Lỗi', 'Không thể cập nhật ảnh đại diện');
        } finally {
            setLoading(false);
            setSelectedFile(null);
        }
    };

    // Cancel avatar change
    const handleCancelAvatar = () => {
        setAvatarUrl(prevAvatar);
        setPrevAvatar(null);
        setAvatarChanged(false);
        setUploadError('');
        setSelectedFile(null);
    };

    // Save profile changes
    const handleSaveProfile = async () => {
        if (!formData.fullName.trim()) {
            showNotification('error', 'Lỗi', 'Vui lòng nhập họ và tên');
            return;
        }

        setLoading(true);
        try {
            // Gọi API để cập nhật thông tin giảng viên
            const response = await putWithAuth<InstructorResponse>(ENDPOINTS.INSTRUCTOR.UPDATE_PROFILE, {
                fullName: formData.fullName,
                title: formData.title,
            });

            if (response) {
                setInstructor({
                    ...instructor!,
                    fullName: formData.fullName,
                    title: formData.title,
                });
                setIsEditing(false);
                showNotification('success', 'Thành công', 'Thông tin đã được cập nhật');
            } else {
                throw new Error('Không thể cập nhật thông tin');
            }
        } catch (error) {
            showNotification('error', 'Lỗi', 'Không thể cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        if (instructor) {
            setFormData({
                fullName: instructor.fullName,
                title: instructor.title || '',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="flex items-center p-8 bg-white rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error || !instructor) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <svg className="w-16 h-16 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h2 className="mt-4 text-xl font-bold text-slate-900">Không tìm thấy thông tin giảng viên</h2>
                    <p className="mt-2 text-slate-600">{error || 'Vui lòng liên hệ quản trị viên để được hỗ trợ'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header Section with Title and Tips Button */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Hồ Sơ Giảng Viên</h1>
                        <p className="mt-1 text-slate-600">Cá nhân hóa thông tin để nổi bật hơn</p>
                    </div>
                    <button
                        onClick={() => setShowProfileTips(!showProfileTips)}
                        className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-all"
                    >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        {showProfileTips ? "Ẩn mẹo" : "Xem mẹo tối ưu"}
                    </button>
                </div>

                {/* Tips Section - Conditionally rendered based on showProfileTips */}
                {showProfileTips && (
                    <div className="mb-6">
                        <ProfileTips isOpen={true} toggleOpen={() => {}} />
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8 min-h-full">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                            <div className="flex flex-col items-center">
                                <div className={loading ? "relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md animate-pulse" : "relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md"}>
                                    <img
                                        src={avatarUrl || '/default-avatar.png'}
                                        alt={instructor.fullName}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <label
                                            htmlFor="avatar-upload"
                                            className="p-3 bg-white text-indigo-600 rounded-full cursor-pointer hover:bg-indigo-50 transition-all transform hover:scale-110"
                                        >
                                            <Upload className="w-6 h-6" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarUpload}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {avatarChanged && (
                                    <div className="mt-4 flex gap-3 w-full">
                                        <button
                                            className="flex-1 flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50"
                                            onClick={handleSaveAvatar}
                                            disabled={loading || !!uploadError}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Đang lưu
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Lưu
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="flex-1 flex items-center px-3 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 hover:scale-105 transition-all disabled:opacity-50"
                                            onClick={handleCancelAvatar}
                                            disabled={loading}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Hủy
                                        </button>
                                    </div>
                                )}
                                <div className="mt-4 text-center">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            instructor.isActive
                                                ? 'bg-teal-100 text-teal-800'
                                                : 'bg-rose-100 text-rose-800'
                                        }`}
                                    >
                                        {instructor.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                                    </span>
                                </div>
                                <button
                                    className="mt-4 flex items-center justify-between w-full px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                                    onClick={() => setShowUploadInfo(!showUploadInfo)}
                                >
                                    <div className="flex items-center">
                                        <Info className="w-4 h-4 mr-2 text-indigo-600" />
                                        <span className="text-sm font-medium text-slate-900">Điều kiện upload ảnh</span>
                                    </div>
                                    {showUploadInfo ? (
                                        <ChevronUp className="w-4 h-4 text-slate-600" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-600" />
                                    )}
                                </button>
                                {showUploadInfo && <FileUploadInfo />}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            {uploadError && (
                                <Alert type="error" className="mb-6">
                                    <div className="flex items-center">
                                        <X className="w-5 h-5 mr-2" />
                                        <span>{uploadError}</span>
                                    </div>
                                </Alert>
                            )}

                            <div className="mb-8">
                                {!isEditing ? (
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900">{instructor.fullName}</h2>
                                        <p className="mt-2 text-lg text-slate-600">{instructor.title || 'Giảng viên'}</p>
                                        <p className="mt-2 text-sm text-slate-500">Ngày tạo: {formattedCreatedAt}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-slate-50"
                                                placeholder="Nhập họ và tên"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Chức danh</label>
                                            <AutocompleteInput
                                                value={formData.title}
                                                onChange={(value) => setFormData({ ...formData, title: value })}
                                                placeholder="Nhập chức danh"
                                                label=""
                                                helperText=""
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Ngày tạo: {formattedCreatedAt}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-200 pt-6 bg-white">
                                <div className="flex justify-end gap-4">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="flex items-center px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 hover:scale-105 transition-all disabled:opacity-50"
                                                disabled={loading}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50"
                                                disabled={loading || !formData.fullName.trim()}
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                        Đang lưu...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Lưu thông tin
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:scale-105 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Sửa thông tin
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};