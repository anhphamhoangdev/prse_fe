import React, { useState, useEffect } from "react";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { Lightbulb, BookOpen, DollarSign, Award, CheckCircle, ChevronRight, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const steps = [
    {
        number: 1,
        title: "Đăng ký & Thanh toán",
        description: "Thanh toán phí 200.000 VNĐ để kích hoạt tài khoản Instructor của bạn."
    },
    {
        number: 2,
        title: "Tạo khóa học",
        description: "Thiết kế và xây dựng khóa học với các công cụ chuyên nghiệp."
    },
    {
        number: 3,
        title: "Bắt đầu kiếm tiền",
        description: "Thu 70% doanh thu từ mỗi khóa học bán ra trên nền tảng."
    }
];

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

        navigate("/register-instructor");
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
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

    // Animation variants cho quy trình
    const processContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.8, // Delay giữa các step (0.8 giây)
                delayChildren: 0.3    // Delay ban đầu trước khi step đầu tiên xuất hiện
            }
        }
    };

    const stepVariants = {
        hidden: {
            opacity: 0,
            x: -30,
            filter: "blur(4px)"
        },
        visible: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.1,
                ease: "easeOut"
            }
        }
    };

    // Animation cho vạch kết nối
    const lineVariants = {
        hidden: { height: 0 },
        visible: {
            height: "100%",
            transition: {
                duration: 2,
                ease: "easeInOut"
            }
        }
    };

    // Quyền lợi thu gọn
    const benefits = [
        {
            icon: <DollarSign className="w-5 h-5 text-green-500" />,
            title: "Hưởng 70% doanh thu",
            description: "Thu nhập hấp dẫn từ mỗi khóa học bán được"
        },
        {
            icon: <BookOpen className="w-5 h-5 text-blue-500" />,
            title: "Quản lý nội dung",
            description: "Toàn quyền tạo và cập nhật khóa học"
        },
        {
            icon: <Award className="w-5 h-5 text-purple-500" />,
            title: "Xây dựng thương hiệu",
            description: "Khẳng định vị thế chuyên môn cá nhân"
        }
    ];

    return (
        <SearchHeaderAndFooterLayout>
            <div className="relative overflow-hidden">
                {/* Hero Background */}
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

                <div className="container mx-auto px-4 py-8 relative z-10">
                    {/* Header - Thu gọn */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
                            Trở thành Instructor
                        </h1>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            Chia sẻ kiến thức, truyền cảm hứng và tạo thu nhập từ chuyên môn của bạn
                        </p>
                    </motion.div>

                    {/* Main content - 3 cột ngang */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start max-w-6xl mx-auto mb-12">
                        {/* Cột 1: Quyền lợi Instructor */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 h-full"
                        >
                            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Award className="w-5 h-5 text-blue-600 mr-2" />
                                    Quyền lợi Instructor
                                </h2>
                            </div>

                            <div className="p-4 space-y-3">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-md"
                                    >
                                        <div className="bg-white p-2 rounded-full shadow-sm">
                                            {benefit.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">{benefit.title}</h3>
                                            <p className="text-xs text-gray-600">{benefit.description}</p>
                                        </div>
                                    </motion.div>
                                ))}

                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">
                                        <p className="font-medium text-blue-800 mb-1">Tại sao nên trở thành Instructor?</p>
                                        <p className="text-xs">Chia sẻ kiến thức, xây dựng thương hiệu và tạo thu nhập từ chuyên môn của bạn.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Cột 2: Thanh toán */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 h-full"
                        >
                            <div className="p-4 border-b bg-gradient-to-r from-green-50 to-green-100">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                                    Gói Instructor
                                </h2>
                            </div>

                            <div className="p-4">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-4 text-white mb-4">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold">Premium</h3>
                                        <div className="mt-2 mb-1">
                                            <span className="text-3xl font-bold">200.000</span>
                                            <span className="text-lg ml-1">VNĐ</span>
                                        </div>
                                        <p className="opacity-80 text-sm">Thanh toán một lần, trọn đời</p>
                                    </div>
                                </div>

                                <ul className="space-y-2 mb-4 text-sm">
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600">Hưởng <span className="font-semibold">70%</span> doanh thu</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600">Toàn quyền quản lý nội dung</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600">Công cụ phân tích dữ liệu</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600">Thanh toán nhanh chóng</span>
                                    </li>
                                </ul>

                                <motion.button
                                    variants={buttonVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={handlePaymentRedirect}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg flex items-center justify-center"
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                >
                                    <span>Trở thành Instructor</span>
                                    <motion.div
                                        animate={{ x: isHovering ? 5 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronRight className="ml-2 w-5 h-5" />
                                    </motion.div>
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Cột 3: Quy trình đơn giản với animation xuất hiện dần */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 h-full"
                        >
                            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-purple-100">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
                                    Quy trình đơn giản
                                </h2>
                            </div>

                            <div className="p-4">
                                <motion.div
                                    className="space-y-6"
                                    variants={processContainerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <div className="relative">
                                        {/* Line connecting steps */}
                                        <motion.div
                                            className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-100 z-0"
                                            variants={lineVariants}
                                        ></motion.div>

                                        {/* Individual steps */}
                                        {steps.map((step, index) => (
                                            <motion.div
                                                key={step.number}
                                                className="relative z-10 flex items-start mb-6 last:mb-0"
                                                variants={stepVariants}
                                            >
                                                <div className="flex-shrink-0">
                                                    <motion.div
                                                        className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"
                                                        initial={{ scale: 0.6, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{
                                                            delay: 0.8 * index + 0.3, // Match the stagger timing
                                                            duration: 0.4,
                                                            type: "spring"
                                                        }}
                                                    >
                                                        <span className="text-lg font-bold">{step.number}</span>
                                                    </motion.div>
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="font-semibold text-gray-800 mb-1">{step.title}</h3>
                                                    <p className="text-sm text-gray-600">{step.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}