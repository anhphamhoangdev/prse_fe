import {useState} from "react";
import React from "react";
import {SearchHeaderAndFooterLayout} from "../layouts/UserLayout";
import {Link} from "react-router-dom";
import {ConfirmPasswordInput, MainPasswordInput} from "../components/common/PasswordSignupInput";

export function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        // Implement signup logic here
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="flex-1 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Tạo tài khoản mới nhé !
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Đã có tài khoản ?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Đăng nhập
                        </Link>
                    </p>
                </div>

                <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
                        <form className="space-y-5" onSubmit={handleSignup}>
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Họ và tên
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@gmail.com"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <MainPasswordInput
                                password={password}
                                setPassword={setPassword}
                            />

                            <ConfirmPasswordInput
                                confirmPassword={confirmPassword}
                                setConfirmPassword={setConfirmPassword}
                                originalPassword={password}
                            />


                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={agreeToTerms}
                                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                                        required
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-700">
                                        Tôi đồng ý với{' '}
                                        <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                                            Điều khoản sử dụng
                                        </Link>
                                        {' '}và{' '}
                                        <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                                            Chính sách bảo mật
                                        </Link>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Tạo tài khoản
                                </button>
                            </div>
                        </form>

                        {/* Social login section remains the same */}
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}