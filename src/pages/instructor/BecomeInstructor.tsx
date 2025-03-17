import React, { useState, useEffect } from "react";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { Lightbulb, BookOpen, DollarSign, Award, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function BecomeInstructor() {
    const navigate = useNavigate();
    const [isHovering, setIsHovering] = useState(false);

    // Kiểm tra token khi component được mount
    useEffect(() => {
        const checkAuth = () => {
            // Lấy token từ localStorage hoặc nơi bạn lưu trữ
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            // Nếu không có token, chuyển hướng đến trang đăng nhập
            if (!token) {
                navigate("/login", {
                    state: {
                        from: "/become-instructor",
                        message: "Vui lòng đăng nhập để trở thành Instructor"
                    }
                });
            }
        };

        checkAuth();
    }, [navigate]);

    const handlePaymentRedirect = () => {
        // Kiểm tra token một lần nữa trước khi chuyển hướng đến trang thanh toán
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate("/login", {
                state: {
                    from: "/become-instructor",
                    message: "Vui lòng đăng nhập để trở thành Instructor"
                }
            });
            return;
        }

        navigate("/payment/instructor");
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.3,
                duration: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.3 }
        },
        tap: { scale: 0.95 }
    };

    const benefits = [
        {
            icon: <BookOpen className="w-8 h-8 text-blue-500" />,
            title: "Tạo và Quản lý Khóa học",
            description: "Toàn quyền quản lý nội dung và cập nhật khóa học của bạn. Tự do thiết kế trải nghiệm học tập độc đáo cho học viên."
        },
        {
            icon: <DollarSign className="w-8 h-8 text-green-500" />,
            title: "Thu nhập Không giới hạn",
            description: "Kiếm tiền từ mỗi khóa học bán được. Hệ thống ăn chia minh bạch với 70% doanh thu thuộc về bạn."
        },
        {
            icon: <Award className="w-8 h-8 text-purple-500" />,
            title: "Xây dựng Thương hiệu Cá nhân",
            description: "Chia sẻ kiến thức chuyên môn để khẳng định vị thế trong ngành và xây dựng cộng đồng học viên trung thành."
        },
        {
            icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
            title: "Công cụ Quản lý Hiệu quả",
            description: "Truy cập vào bộ công cụ chuyên nghiệp để theo dõi hiệu suất khóa học, phản hồi học viên và tối ưu hóa nội dung."
        }
    ];

    return (
        <SearchHeaderAndFooterLayout>
            <div className="relative overflow-hidden">
                {/* Hero Background with subtle animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 z-0">
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        transition={{
                            duration: 20,
                            ease: "linear",
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%239C92AC" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
                            backgroundSize: '150px 150px'
                        }}
                    />
                </div>

                <div className="container mx-auto px-4 py-12 relative z-10">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
                            Trở thành Instructor
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                            Chia sẻ kiến thức, truyền cảm hứng và tạo ra thu nhập từ chuyên môn của bạn
                        </p>
                    </motion.div>

                    {/* Main content section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left side: Features and benefits */}
                        <motion.div
                            className="space-y-10"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-blue-500">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tại sao nên trở thành Instructor?</h2>
                                <p className="text-gray-600">
                                    Trở thành Instructor mở ra cơ hội chia sẻ kiến thức, xây dựng thương hiệu cá nhân và
                                    tạo thu nhập bền vững từ những kinh nghiệm và chuyên môn đã tích lũy.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="mb-4">{benefit.icon}</div>
                                        <h3 className="text-lg font-semibold mb-2 text-gray-800">{benefit.title}</h3>
                                        <p className="text-sm text-gray-600">{benefit.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right side: Pricing card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex justify-center"
                        >
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full border border-gray-100">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                                    <h3 className="text-2xl font-bold">Instructor Premium</h3>
                                    <p className="opacity-75 mt-1">Khởi đầu sự nghiệp giảng dạy</p>
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-center items-end mb-6">
                                        <span className="text-4xl font-bold text-gray-800">200.000</span>
                                        <span className="text-xl text-gray-600 ml-1">VNĐ</span>
                                    </div>

                                    <p className="text-center text-gray-500 mb-8">
                                        Thanh toán một lần, trở thành Instructor trọn đời
                                    </p>

                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Hưởng <span className="font-semibold">70%</span> doanh thu từ mỗi khóa học bán được</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Toàn quyền quản lý và cập nhật nội dung khóa học</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Công cụ phân tích dữ liệu và báo cáo chi tiết</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Thanh toán nhanh chóng, rút tiền dễ dàng</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">Hỗ trợ kỹ thuật và tư vấn từ đội ngũ chuyên nghiệp</span>
                                        </li>
                                    </ul>

                                    <motion.button
                                        variants={buttonVariants}
                                        initial="initial"
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handlePaymentRedirect}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg flex items-center justify-center"
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                    >
                                        <span>Trở thành Instructor ngay</span>
                                        <motion.div
                                            animate={{ x: isHovering ? 5 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </motion.div>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Testimonials or additional info section */}
                    <motion.div
                        className="mt-20 bg-white rounded-xl shadow-lg p-8 border border-gray-100"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Quy trình đơn giản</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-xl font-bold">1</span>
                                </div>
                                <h3 className="font-semibold mb-2">Đăng ký & Thanh toán</h3>
                                <p className="text-gray-600 text-sm">Hoàn tất thanh toán phí 200.000 VNĐ để kích hoạt tài khoản Instructor.</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-xl font-bold">2</span>
                                </div>
                                <h3 className="font-semibold mb-2">Tạo khóa học</h3>
                                <p className="text-gray-600 text-sm">Thiết kế và xây dựng khóa học của bạn với các công cụ chuyên nghiệp.</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-xl font-bold">3</span>
                                </div>
                                <h3 className="font-semibold mb-2">Bắt đầu kiếm tiền</h3>
                                <p className="text-gray-600 text-sm">Thu 70% doanh thu từ mỗi khóa học được bán ra trên nền tảng.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}