import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {requestPost} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";

interface AdminLoginResponse {
    error_message: string;
    code: number;
    data: {
        jwt?: {
            token: string;
        }
    };
}

export function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
        if (token) {
            navigate("/admin/dashboard");
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) return;

        try {
            setLoading(true);
            const response = await requestPost<AdminLoginResponse>(ENDPOINTS.ADMIN.LOGIN, {
                username: email,
                password
            });

            if (response.code === 1 && response.data.jwt?.token) {
                sessionStorage.setItem("adminToken", response.data.jwt.token);
                navigate("/admin/dashboard");
            } else {
                setError(response.error_message);
            }
        } catch (err) {
            setError("Đã có lỗi xảy ra khi đăng nhập");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white"></div>
                <div className="absolute right-0 top-0 w-1/3 h-1/3 bg-blue-600/10 blur-3xl rounded-full"></div>
                <div className="absolute left-0 bottom-0 w-1/3 h-1/3 bg-blue-600/10 blur-3xl rounded-full"></div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="min-h-screen relative z-10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row min-h-screen items-center gap-8 lg:gap-16">

                        {/* Left Column - Brand Info */}
                        <div className="w-full lg:w-1/2 py-12 lg:py-0">
                            <div className="max-w-lg mx-auto lg:mx-0">
                                {/* Logo */}
                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <span className="text-3xl font-black text-white">EE</span>
                                    </div>
                                </div>

                                {/* Brand Content */}
                                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                                    <span className="text-blue-600">Easy</span>
                                    <span>Edu</span>
                                </h1>
                                <p className="text-xl text-gray-600 mb-8">Admin Control Panel</p>

                                {/* Additional Info */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/50 rounded-2xl backdrop-blur-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Quản lý hệ thống giáo dục
                                        </h3>
                                        <p className="text-gray-600">
                                            Hệ thống quản trị tập trung cho phép bạn kiểm soát và theo dõi toàn bộ hoạt động giáo dục một cách hiệu quả.
                                        </p>
                                    </div>
                                    <div className="p-6 bg-white/50 rounded-2xl backdrop-blur-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Bảo mật & An toàn
                                        </h3>
                                        <p className="text-gray-600">
                                            Hệ thống được bảo vệ bằng các biện pháp bảo mật cao cấp, đảm bảo thông tin luôn được an toàn.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Login Form */}
                        <div className="w-full lg:w-1/2 py-12 lg:py-0">
                            <div className="max-w-md mx-auto">
                                <div className="bg-white rounded-2xl p-8 shadow-xl">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                                    <p className="text-gray-600 mb-8">Đăng nhập để quản lý hệ thống</p>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                                            <p className="text-sm text-red-500">{error}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring focus:ring-blue-100 transition-all"
                                                placeholder="admin@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring focus:ring-blue-100 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Đang xử lý...</span>
                                                </div>
                                            ) : (
                                                'Đăng nhập'
                                            )}
                                        </button>
                                    </form>
                                </div>

                                <p className="mt-8 text-center text-sm text-gray-600">
                                    Chỉ dành cho quản trị viên hệ thống
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}