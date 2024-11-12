import {useState} from "react";
import React from "react";
import {SearchHeaderAndFooterLayout} from "../layouts/UserLayout";
import {Link, useNavigate} from "react-router-dom";
import {requestPost} from "../utils/request";
import {ENDPOINTS} from "../constants/endpoint";

interface JwtData {
    token: string;
}

interface LoginResponse
{
    error_message: string // Có thể là string hoặc object rỗng
    code: number;  // 1 là success, 0 là error
    data: {
        jwt? : JwtData
    };

}

export function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")

    const navigate = useNavigate(); // Khởi tạo useNavigate


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("")

        const loginRequest = {
            username,
            password,
            rememberMe
        }

        if(username && password)
        {
            setLoading(true);
            const response = await requestPost<LoginResponse>(ENDPOINTS.STUDENT.LOGIN, loginRequest);
            if(response.code === 1)
            {
                if(rememberMe) {
                    sessionStorage.removeItem("token");
                    localStorage.setItem("token", response.data.jwt?.token ? response.data.jwt?.token : "");
                }
                else {
                    localStorage.removeItem("token");
                    sessionStorage.setItem("token", response.data.jwt?.token ? response.data.jwt?.token : "");
                }

                navigate("/")
            }
            else
            {
                setError(response.error_message);
            }
            setLoading(false);
        }
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="flex-1 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Chào mừng quay trở lại !
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Không có tài khoản ?{' '}
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Đăng ký
                        </Link>
                    </p>
                </div>

                <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">

                        {error && (
                            <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
                                {error}
                            </div>
                        )}
                        <form className="space-y-5" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Tên đăng nhập
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="ute123"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Mật khẩu
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                        Quên mật khẩu
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white mr-2"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang đăng nhập...
                                        </>
                                    ) : (
                                        'Đăng nhập'
                                    )}
                                </button>
                            </div>
                        </form>


                        {/*OATH2*/}
                        {/*<div className="mt-6">*/}
                        {/*    <div className="relative">*/}
                        {/*        <div className="absolute inset-0 flex items-center">*/}
                        {/*            <div className="w-full border-t border-gray-300" />*/}
                        {/*        </div>*/}
                        {/*        <div className="relative flex justify-center text-sm">*/}
                        {/*            <span className="px-2 bg-white text-gray-500">Or continue with</span>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}

                        {/*    <div className="mt-6 grid grid-cols-2 gap-3">*/}
                        {/*        <button className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">*/}
                        {/*            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">*/}
                        {/*                <path*/}
                        {/*                    fill="currentColor"*/}
                        {/*                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"*/}
                        {/*                />*/}
                        {/*            </svg>*/}
                        {/*            Google*/}
                        {/*        </button>*/}
                        {/*        <button className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">*/}
                        {/*            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">*/}
                        {/*                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>*/}
                        {/*            </svg>*/}
                        {/*            Facebook*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}