import React, { useEffect, useState } from "react";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import {Mail, Phone, CalendarDays, User, MoreHorizontal, Check, X, Upload, AlertCircle, Info} from "lucide-react";
import {requestPostWithAuth, requestWithAuth} from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import {Alert} from "../../components/common/Alert";
import {uploadAvatar} from "../../services/studentService";
import {ChangePasswordModal} from "./ChangePasswordModal";

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

// Thêm các hàm utility để mask thông tin
const maskEmail = (email: string): string => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email; // Không mask nếu username quá ngắn

    const maskedUsername = username.charAt(0) +
        '*'.repeat(username.length - 2) +
        username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
};

const maskPhoneNumber = (phone: string): string => {
    // Loại bỏ các ký tự không phải số
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) return phone; // Không mask nếu số điện thoại quá ngắn

    // Giữ lại 3 số đầu và 2 số cuối, mask phần còn lại
    const prefix = cleanPhone.slice(0, 3);
    const suffix = cleanPhone.slice(-2);
    const maskedPart = '*'.repeat(cleanPhone.length - 5);

    return `${prefix}${maskedPart}${suffix}`;
};

const MAX_FILE_SIZE = 1024 * 1024; // 1MB trong bytes
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const FileUploadInfo = () => (
    <div className="mt-4 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Điều kiện upload ảnh:</h4>
        <ul className="list-disc list-inside space-y-1">
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


    //
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
    } | null>(null);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 3000); // Hide after 3 seconds

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
            // Keep modal open so user can try again
        }
    };

    const validateFile = (file: File): boolean => {
        // Reset error state
        setUploadError("");

        // Kiểm tra kích thước
        if (file.size > MAX_FILE_SIZE) {
            setUploadError(`Kích thước file (${(file.size / 1024 / 1024).toFixed(2)}MB) vượt quá giới hạn 1MB`);
            return false;
        }

        // Kiểm tra định dạng
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
            // Validate file
            const isValid = validateFile(file);

            if (!isValid) {
                e.target.value = '';
                return;
            }

            // Lưu file vào state
            setSelectedFile(file);

            // Lưu avatar hiện tại để có thể khôi phục nếu cần
            setPrevAvatar(userData?.avatarUrl || null);

            // Đọc và hiển thị preview
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
            console.log(result);
            if (result.success && result.avatarUrl) {
                setUserData(prev => prev ? {
                    ...prev,
                    avatarUrl: result.avatarUrl
                } : null);

                setAvatarChanged(false);
                setPrevAvatar(null);
                setUploadError("");
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
        setSelectedFile(null); // Reset selected file
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6">Hồ sơ người dùng</h1>
                {alertMessage && (
                    <div className="mb-4">
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
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Đang tải...</span>
                    </div>
                ) : error ? (
                    <Alert type="error" className="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </Alert>
                ) : userData ? (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3">
                            <div className="md:col-span-1 p-6 flex flex-col items-center justify-center border-r">
                                <div
                                    className="relative w-40 h-40 rounded-full overflow-hidden mb-4"
                                    onMouseEnter={() => setShowUploadInfo(true)}
                                    onMouseLeave={() => setShowUploadInfo(false)}
                                >
                                    <img
                                        src={userData.avatarUrl || '/default-avatar.png'}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <label
                                            htmlFor="avatar-upload"
                                            className="p-2 bg-blue-500 text-white rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition-colors duration-300 transform hover:scale-110"
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

                                {showUploadInfo && <FileUploadInfo />}

                                {uploadError && (
                                    <Alert type="error" className="mt-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>{uploadError}</span>
                                    </Alert>
                                )}

                                <h2 className="text-2xl font-bold mt-4">{userData.fullName}</h2>
                                <p className="text-gray-500">{userData.username}</p>

                                {avatarChanged && (
                                    <div className="mt-4 space-x-2">
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleSaveAvatar}
                                            disabled={loading || !!uploadError}
                                        >
                                            {loading ? 'Đang lưu...' : 'Lưu ảnh'}
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleCancelAvatar}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Rest of the component remains the same */}
                            <div className="md:col-span-2 p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Contact Information Section */}
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Thông tin liên hệ</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <Mail className="w-5 h-5 mr-2 text-gray-500"/>
                                                <span>{maskEmail(userData.email)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="w-5 h-5 mr-2 text-gray-500"/>
                                                <span>{maskPhoneNumber(userData.phoneNumber)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Information Section */}
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Thông tin cá nhân</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <CalendarDays className="w-5 h-5 mr-2 text-gray-500"/>
                                                <span>Ngày sinh: {userData.dateOfBirth}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MoreHorizontal className="w-5 h-5 mr-2 text-gray-500"/>
                                                <span>
                                                    Giới tính: {userData.gender === "MALE" ? "Nam" : userData.gender === "FEMALE" ? "Nữ" : "Khác"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Status and Finance Sections */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Trạng thái tài khoản</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                {userData.isActive ?
                                                    <Check className="w-5 h-5 mr-2 text-green-500"/> :
                                                    <X className="w-5 h-5 mr-2 text-red-500"/>
                                                }
                                                <span>Hoạt động: {userData.isActive ? "Có" : "Không"}</span>
                                            </div>
                                            <div className="flex items-center">
                                                {userData.isBlocked ?
                                                    <X className="w-5 h-5 mr-2 text-red-500"/> :
                                                    <Check className="w-5 h-5 mr-2 text-green-500"/>
                                                }
                                                <span>Bị chặn: {userData.isBlocked ? "Có" : "Không"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Tài chính và điểm thưởng</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <span className="font-semibold">Tiền:</span>
                                                <span className="ml-2">{userData.money.toLocaleString()} VND</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold">Điểm:</span>
                                                <span className="ml-2">{userData.point}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-100 px-6 py-4 flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 text-blue-500 font-semibold border border-blue-500 rounded-md hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-300"
                                onClick={handleChangePassword}
                            >
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
                    <div>Không có dữ liệu người dùng.</div>
                )}
            </div>
        </SearchHeaderAndFooterLayout>
    );
}