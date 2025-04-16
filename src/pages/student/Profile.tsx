import React, { useEffect, useState } from "react";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import {
    Mail, Phone, CalendarDays, User, MoreHorizontal, Check, X, Upload,
    AlertCircle, Info, CreditCard, Award, Shield, UserCircle, RefreshCw
} from "lucide-react";
import { requestPostWithAuth, requestWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import { Alert } from "../../components/common/Alert";
import { uploadAvatar } from "../../services/studentService";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface UserData {
    id: number;
    username: string;
    email: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    isActive: boolean;
    isBlocked: boolean;
    money: number;
    point: number;
    avatarUrl: string | null;
}

interface ProfileResponse {
    student: UserData;
}

// Hàm utility để mask thông tin
const maskEmail = (email: string): string => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;

    const maskedUsername = username.charAt(0) +
        '*'.repeat(username.length - 2) +
        username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
};

const maskPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) return phone;

    const prefix = cleanPhone.slice(0, 3);
    const suffix = cleanPhone.slice(-2);
    const maskedPart = '*'.repeat(cleanPhone.length - 5);

    return `${prefix}${maskedPart}${suffix}`;
};

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

export function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [avatarChanged, setAvatarChanged] = useState(false);
    const [prevAvatar, setPrevAvatar] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string>("");
    const [showUploadInfo, setShowUploadInfo] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
    } | null>(null);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await requestWithAuth<ProfileResponse>(ENDPOINTS.STUDENT.PROFILE);
            setUserData(response.student);
            setError("");
        } catch (error) {
            setError("Không thể tải thông tin người dùng");
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = () => {
        setShowPasswordModal(true);
    };

    const handleChangePasswordSubmit = async (oldPassword: string, newPassword: string) => {
        try {
            await requestPostWithAuth(
                ENDPOINTS.STUDENT.UPDATE_PASSWORD,
                {
                    oldPassword,
                    newPassword
                }
            );

            setAlertMessage({
                type: 'success',
                message: 'Đổi mật khẩu thành công!'
            });
            setShowPasswordModal(false);
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đổi mật khẩu'
            });
        }
    };

    const validateFile = (file: File): boolean => {
        setUploadError("");

        if (file.size > MAX_FILE_SIZE) {
            setUploadError(`Kích thước file (${(file.size / 1024 / 1024).toFixed(2)}MB) vượt quá giới hạn 1MB`);
            return false;
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setUploadError("Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc WEBP");
            return false;
        }

        return true;
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const isValid = validateFile(file);

            if (!isValid) {
                e.target.value = '';
                return;
            }

            setSelectedFile(file);
            setPrevAvatar(userData?.avatarUrl || null);

            const reader = new FileReader();
            reader.onload = (event) => {
                setUserData(prev => prev ? ({
                    ...prev,
                    avatarUrl: event.target?.result as string
                }) : null);
                setAvatarChanged(true);
            };

            reader.onerror = () => {
                setUploadError("Có lỗi xảy ra khi đọc file. Vui lòng thử lại.");
                setSelectedFile(null);
                e.target.value = '';
            };

            reader.readAsDataURL(file);

        } catch (error) {
            setUploadError("Có lỗi xảy ra trong quá trình xử lý ảnh. Vui lòng thử lại.");
            setSelectedFile(null);
            e.target.value = '';
            console.error('Error handling avatar upload:', error);
        }
    };

    const handleSaveAvatar = async () => {
        try {
            setLoading(true);

            if (!selectedFile) {
                setUploadError("Không có file được chọn");
                return;
            }

            const result = await uploadAvatar(selectedFile);
            if (result.success && result.avatarUrl) {
                setUserData(prev => prev ? {
                    ...prev,
                    avatarUrl: result.avatarUrl
                } : null);

                setAvatarChanged(false);
                setPrevAvatar(null);
                setUploadError("");
                setAlertMessage({
                    type: 'success',
                    message: 'Cập nhật ảnh đại diện thành công!'
                });
            } else {
                setUploadError(result.error || "Không thể cập nhật ảnh đại diện");
                handleCancelAvatar();
            }
        } catch (error) {
            setUploadError("Có lỗi xảy ra khi cập nhật ảnh đại diện");
            handleCancelAvatar();
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAvatar = () => {
        if (prevAvatar) {
            setUserData(prev => prev ? ({ ...prev, avatarUrl: prevAvatar }) : null);
            setPrevAvatar(null);
        }
        setAvatarChanged(false);
        setUploadError("");
        setSelectedFile(null);
    };

    // Format money with currency symbol
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Helper function to get gender text
    const getGenderText = (gender: string) => {
        switch (gender) {
            case "MALE": return "Nam";
            case "FEMALE": return "Nữ";
            default: return "Khác";
        }
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header with refresh button */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Hồ sơ người dùng
                        </h1>
                        <button
                            onClick={fetchUserProfile}
                            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5 mr-1" />
                            <span>Làm mới</span>
                        </button>
                    </div>

                    {/* Alert message */}
                    {alertMessage && (
                        <div className="mb-6 animate-fadeIn">
                            <Alert type={alertMessage.type}>
                                <div className="flex items-center">
                                    {alertMessage.type === 'success' && <Check className="w-5 h-5 mr-2" />}
                                    {alertMessage.type === 'error' && <X className="w-5 h-5 mr-2" />}
                                    {alertMessage.type === 'warning' && <AlertCircle className="w-5 h-5 mr-2" />}
                                    {alertMessage.type === 'info' && <Info className="w-5 h-5 mr-2" />}
                                    <span>{alertMessage.message}</span>
                                </div>
                            </Alert>
                        </div>
                    )}

                    {/* Loading state */}
                    {loading ? (
                        <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-lg">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Đang tải...</span>
                        </div>
                    ) : error ? (
                        <Alert type="error" className="mb-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                <span>{error}</span>
                            </div>
                        </Alert>
                    ) : userData ? (
                        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
                            {/* Main content */}
                            <div className="md:flex gap-6">
                                {/* Left column - Avatar and basic info */}
                                <div className="md:w-1/3 p-6 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
                                    <div className="relative">
                                        <div
                                            className="relative w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg"
                                            onMouseEnter={() => setShowUploadInfo(true)}
                                            onMouseLeave={() => setShowUploadInfo(false)}
                                        >
                                            <img
                                                src={userData.avatarUrl || '/default-avatar.png'}
                                                alt="User Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                                <label
                                                    htmlFor="avatar-upload"
                                                    className="p-3 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                                                >
                                                    <Upload className="w-6 h-6" />
                                                    <span className="sr-only">Upload Avatar</span>
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
                                        {/* Removed the active status indicator */}
                                    </div>

                                    {showUploadInfo && <FileUploadInfo />}

                                    {uploadError && (
                                        <Alert type="error" className="mt-4 w-full">
                                            <div className="flex items-center">
                                                <AlertCircle className="w-5 h-5 mr-2" />
                                                <span>{uploadError}</span>
                                            </div>
                                        </Alert>
                                    )}

                                    <h2 className="text-2xl font-bold mt-4 text-gray-800">{userData.fullName}</h2>
                                    <p className="text-gray-500 mb-4">@{userData.username}</p>

                                    {/* Removed the status pill */}

                                    {avatarChanged && (
                                        <div className="mt-4 space-x-2 flex w-full">
                                            <button
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                onClick={handleSaveAvatar}
                                                disabled={loading || !!uploadError}
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                        <span>Đang lưu...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        <span>Lưu ảnh</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                onClick={handleCancelAvatar}
                                                disabled={loading}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                <span>Hủy</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Financial stats summary in a more compact layout */}
                                    <div className="w-full mt-6 flex flex-col space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-center">
                                                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                                                <h4 className="font-semibold text-blue-600">Số dư</h4>
                                            </div>
                                            <p className="font-bold text-gray-800">{formatMoney(userData.money)}</p>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <div className="flex items-center">
                                                <Award className="w-5 h-5 text-purple-600 mr-2" />
                                                <h4 className="font-semibold text-purple-600">Điểm</h4>
                                            </div>
                                            <p className="font-bold text-gray-800">{userData.point}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column - User details */}
                                <div className="md:w-2/3 p-6 space-y-6">
                                    {/* Info Tabs */}
                                    <div className="border-b border-gray-200">
                                        <div className="flex items-center px-4 py-2 bg-gray-50 rounded-t-lg">
                                            <UserCircle className="w-5 h-5 text-blue-600 mr-2" />
                                            <h3 className="text-lg font-semibold text-gray-800">Thông tin chi tiết</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Contact Information */}
                                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Thông tin liên hệ</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                        <Mail className="w-5 h-5 text-blue-600"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Email</p>
                                                        <p className="font-medium">{maskEmail(userData.email)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                        <Phone className="w-5 h-5 text-green-600"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Số điện thoại</p>
                                                        <p className="font-medium">{maskPhoneNumber(userData.phoneNumber)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Personal Information */}
                                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Thông tin cá nhân</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                                        <CalendarDays className="w-5 h-5 text-amber-600"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Ngày sinh</p>
                                                        <p className="font-medium">{userData.dateOfBirth}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                                        <User className="w-5 h-5 text-purple-600"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Giới tính</p>
                                                        <p className="font-medium">{getGenderText(userData.gender)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
                                <button
                                    className="flex items-center px-6 py-2 bg-white text-blue-600 font-semibold border border-blue-500 rounded-lg hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-300 shadow-sm"
                                    onClick={handleChangePassword}
                                >
                                    <Shield className="w-5 h-5 mr-2" />
                                    Đổi mật khẩu
                                </button>
                            </div>

                            {/* Change Password Modal */}
                            <ChangePasswordModal
                                isOpen={showPasswordModal}
                                onClose={() => setShowPasswordModal(false)}
                                onSubmit={handleChangePasswordSubmit}
                            />
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <UserCircle className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">Không có dữ liệu người dùng.</p>
                        </div>
                    )}
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}