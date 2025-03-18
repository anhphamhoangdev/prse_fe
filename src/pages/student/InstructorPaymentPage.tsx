import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { AlertCircle, CreditCard, CheckCircle, Award, User, Shield, Zap, Book, BarChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AutocompleteInput } from "../../components/common/AutocompleteInput";
import InstructorPreview from "../../components/instructor/InstructorPreview";
import {PaymentMethod} from "../../types/payment";
import {getPaymentMethods} from "../../services/paymentService";

// Định nghĩa kiểu dữ liệu cho InstructorDraft
interface InstructorDraft {
    id: string;
    price: number;
    discountedPrice: number;
    discountRate: number;
    // Thông tin người dùng bổ sung
    displayName: string;
    title: string;
}

// Dữ liệu quyền lợi
const benefitItems = [
    {
        icon: <Zap className="h-4 w-4 text-yellow-500" />,
        title: "Hưởng 70% doanh thu",
        description: "Thu nhập hấp dẫn từ mỗi khóa học bán được",
        color: "bg-yellow-50 border-yellow-100"
    },
    {
        icon: <Book className="h-4 w-4 text-indigo-500" />,
        title: "Toàn quyền quản lý nội dung",
        description: "Tự do sáng tạo và cập nhật khóa học",
        color: "bg-indigo-50 border-indigo-100"
    },
    {
        icon: <BarChart className="h-4 w-4 text-blue-500" />,
        title: "Công cụ phân tích dữ liệu",
        description: "Báo cáo chi tiết về hiệu suất khóa học",
        color: "bg-blue-50 border-blue-100"
    },
    {
        icon: <Shield className="h-4 w-4 text-green-500" />,
        title: "Hỗ trợ kỹ thuật chuyên nghiệp",
        description: "Đội ngũ kỹ thuật luôn sẵn sàng hỗ trợ",
        color: "bg-green-50 border-green-100"
    },
    {
        icon: <Award className="h-4 w-4 text-purple-500" />,
        title: "Xây dựng thương hiệu cá nhân",
        description: "Trở thành chuyên gia được công nhận",
        color: "bg-purple-50 border-purple-100"
    }
];

export function InstructorPaymentPage() {
    const [instructorDraft, setInstructorDraft] = useState<InstructorDraft>({
        id: `instructor-${Date.now()}`,
        price: 400000,
        discountedPrice: 200000,
        discountRate: 50,
        displayName: "",
        title: ""
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [formValid, setFormValid] = useState(false);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.4,
                ease: "easeOut"
            }
        })
    };

    // Animation variants cho từng benefit item - đã kết hợp với hover/tap effects
    const benefitItemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.2 + (i * 0.1),
                duration: 0.3,
                ease: "easeOut"
            }
        }),
        hover: {
            scale: 1.03,
            y: -2,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        tap: {
            scale: 0.98,
            transition: {
                duration: 0.1
            }
        }
    };

    const handlePaymentMethodChange = (method: PaymentMethod) => {
        setSelectedPaymentMethod(method);
    };

    // Kiểm tra form hợp lệ
    useEffect(() => {
        setFormValid(instructorDraft.displayName.trim() !== "" && instructorDraft.title.trim() !== "");
    }, [instructorDraft]);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const methods = await getPaymentMethods();
                setPaymentMethods(methods);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải phương thức thanh toán");
            } finally {
                setLoadingMethods(false);
            }
        };

        fetchPaymentMethods();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInstructorDraft(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTitleChange = (value: string) => {
        setInstructorDraft(prev => ({
            ...prev,
            title: value
        }));
    };

    const handlePayment = async () => {
        if (!formValid) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        setIsProcessing(true);
        setError("");

        try {
            // Lưu thông tin instructor vào session storage
            sessionStorage.setItem('becomeInstructorDraft', JSON.stringify(instructorDraft));

            // Giả lập thanh toán
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Redirect đến trang thành công
            navigate('/payment/success', {
                state: {
                    transactionId: `INS-${Date.now()}`,
                    status: 'success',
                    type: 'instructor'
                }
            });
        } catch (error) {
            let errorMessage = "Có lỗi xảy ra khi xử lý thanh toán";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Header - Thu gọn */}
                <div className="text-center mb-6">
                    <Award className="w-10 h-10 text-blue-600 mx-auto mb-3"/>
                    <h1 className="text-xl font-bold text-gray-900">Đăng ký trở thành Instructor</h1>
                    <p className="text-gray-600 text-sm mt-1">Hoàn tất thông tin và thanh toán để bắt đầu hành trình chia sẻ kiến thức</p>
                </div>

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <AlertCircle className="h-4 w-4" />
                            <p>{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3 Columns - Benefits, Information, Payment - Chiều cao thấp hơn */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: Benefits - Với animation đẹp */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                        variants={cardVariants}
                        custom={0}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-blue-600" />
                                <h2 className="font-semibold text-gray-800">Quyền lợi Instructor</h2>
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="space-y-2">
                                {benefitItems.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        className={`border rounded-md p-2 ${benefit.color}`}
                                        variants={benefitItemVariants}
                                        custom={index}
                                        initial="hidden"
                                        animate="visible"
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        <div className="flex items-start">
                                            <div className="h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-sm mr-2">
                                                {benefit.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-xs text-gray-800">{benefit.title}</h3>
                                                <p className="text-xs text-gray-600">{benefit.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                className="mt-2 pt-2 border-t border-gray-100 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div className="text-blue-600 font-medium text-xs">
                                    Chia sẻ kiến thức, nhận giá trị xứng đáng
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Column 2: Information Input - Thu gọn */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                        variants={cardVariants}
                        custom={1}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="p-3 border-b bg-gray-50">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-600" />
                                <h2 className="font-semibold text-gray-800">Thông tin Instructor</h2>
                            </div>
                        </div>
                        <div className="p-3 space-y-3">
                            <div>
                                <label htmlFor="displayName" className="block text-xs font-medium text-gray-700 mb-1">
                                    Tên hiển thị
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="displayName"
                                        name="displayName"
                                        value={instructorDraft.displayName}
                                        onChange={handleInputChange}
                                        className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Tên này sẽ hiển thị cho học viên
                                </p>
                            </div>

                            <div className="mt-2">
                                <label htmlFor="title-input" className="block text-xs font-medium text-gray-700 mb-1">
                                    Chức danh/Vị trí
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="title-input"
                                        name="title"
                                        value={instructorDraft.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Senior Java Developer, React Expert..."
                                        required
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <Award className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Chức danh chuyên môn (nên giới hạn 1-2 chức danh)
                                </p>
                            </div>

                            {/* Phần xem trước thông tin - Thu gọn */}
                            <div className="border border-gray-200 rounded-md p-2 mt-2 bg-gray-50">
                                <h3 className="text-xs font-medium text-gray-700 mb-1.5">Xem trước hiển thị</h3>

                                <div className="flex items-center p-2 bg-white rounded-md">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>

                                    <div>
                                        <div className="font-semibold text-sm text-gray-800">
                                            {instructorDraft.displayName || 'Tên Instructor'}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {instructorDraft.title || 'Chức danh chuyên môn'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Column 3: Payment - Thu gọn */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                        variants={cardVariants}
                        custom={2}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="p-3 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                <h2 className="font-semibold text-gray-800">Thanh toán</h2>
                            </div>
                        </div>
                        <div className="p-3 space-y-3">
                            {/* Hiển thị danh sách phương thức thanh toán */}
                            {loadingMethods ? (
                                <div className="text-center text-gray-500 text-xs">Đang tải phương thức thanh toán...</div>
                            ) : paymentMethods.length > 0 ? (
                                <div className="space-y-2">
                                    {paymentMethods.map((method) => (
                                        <motion.div
                                            key={method.id}
                                            className="bg-white p-2 rounded-md border border-gray-200 cursor-pointer"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            onClick={() => handlePaymentMethodChange(method)}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 mr-2 flex-shrink-0">
                                                    <img
                                                        src={method.logoUrl}
                                                        alt={method.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = "https://payos.vn/docs/img/logo.svg"; // Default fallback logo
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-medium text-xs">{method.name}</h3>
                                                </div>
                                                <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center">
                                                    {selectedPaymentMethod?.id === method.id && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-red-500 text-xs">Không có phương thức thanh toán nào khả dụng</div>
                            )}

                            {/* Thông tin giá */}
                            <div className="bg-blue-50 p-2 rounded-md text-xs">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Gói dịch vụ:</span>
                                    <span className="font-medium">Gói Instructor</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Giá gốc:</span>
                                    <span className="font-medium line-through text-gray-500">{instructorDraft.price.toLocaleString()} VNĐ</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Giảm giá ({instructorDraft.discountRate}%):</span>
                                    <span className="font-medium text-green-600">
        -{(instructorDraft.price - instructorDraft.discountedPrice).toLocaleString()} VNĐ
      </span>
                                </div>
                                <div className="pt-1 border-t border-blue-100 flex justify-between">
                                    <span className="font-semibold">Tổng thanh toán:</span>
                                    <span className="font-bold text-blue-600">{instructorDraft.discountedPrice.toLocaleString()} VNĐ</span>
                                </div>
                            </div>

                            {/* Nút thanh toán */}
                            <motion.button
                                onClick={handlePayment}
                                disabled={isProcessing || !formValid || !selectedPaymentMethod}
                                className={`w-full py-2 text-sm rounded-md font-semibold flex items-center justify-center gap-2 ${
                                    isProcessing || !formValid || !selectedPaymentMethod
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                                whileHover={!isProcessing && formValid && selectedPaymentMethod ? { scale: 1.02 } : {}}
                                whileTap={!isProcessing && formValid && selectedPaymentMethod ? { scale: 0.98 } : {}}
                            >
                                {isProcessing ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Hoàn tất đăng ký và thanh toán"
                                )}
                            </motion.button>

                            {/* Thông báo lỗi nếu chưa chọn phương thức thanh toán */}
                            {!selectedPaymentMethod && !isProcessing && formValid && (
                                <div className="text-amber-600 bg-amber-50 p-1.5 rounded text-xs">
                                    Vui lòng chọn một phương thức thanh toán
                                </div>
                            )}

                            {!formValid && (
                                <div className="text-amber-600 bg-amber-50 p-1.5 rounded text-xs">
                                    Vui lòng điền đầy đủ thông tin để thanh toán
                                </div>
                            )}

                            <div className="flex items-start gap-1.5">
                                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-500">
                                    Bằng việc nhấn nút trên, bạn đồng ý với{" "}
                                    <a href="/terms" className="text-blue-600 hover:underline">
                                        điều khoản dịch vụ
                                    </a>
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-100 rounded-md p-1.5">
                                <h4 className="font-medium text-green-800 text-xs flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    Thanh toán an toàn & bảo mật
                                </h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}