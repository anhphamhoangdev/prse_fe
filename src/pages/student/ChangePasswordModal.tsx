import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {ConfirmPasswordInput, MainPasswordInput} from "../../components/common/PasswordSignupInput";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (oldPassword: string, newPassword: string) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSubmit
                                                                        }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validNewPassword, setValidNewPassword] = useState(false);
    const [validConfirmPassword, setValidConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!oldPassword) {
            setError('Vui lòng nhập mật khẩu hiện tại');
            return;
        }

        if (!validNewPassword) {
            setError('Mật khẩu mới không đạt yêu cầu');
            return;
        }

        if (!validConfirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setLoading(true);
            await onSubmit(oldPassword, newPassword);
            // Reset form
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form khi đóng modal
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Mật khẩu hiện tại */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                            >
                                {showOldPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <MainPasswordInput
                        password={newPassword}
                        setPassword={setNewPassword}
                        setValidPassword={setValidNewPassword}
                    />

                    {/* Xác nhận mật khẩu mới */}
                    <ConfirmPasswordInput
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        originalPassword={newPassword}
                        setValidConfirmPassword={setValidConfirmPassword}
                    />

                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            disabled={loading || !validNewPassword || !validConfirmPassword || !oldPassword}
                        >
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};