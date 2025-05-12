import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { ENDPOINTS } from "../../constants/endpoint";
import {
    Headphones,
    AlertCircle,
    Send,
    ChevronLeft,
    BookOpen,
    DollarSign,
    User,
    Layout,
    Key,
    ChevronDown,
    CheckCircle
} from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { requestPostWithAuth } from "../../utils/request";

interface PaymentItem {
    id: number;
    courseId: number;
    title: string;
    price: number;
    imageUrl?: string;
}

interface LocationState {
    courseId?: number;
    courseName?: string;
    transactionId?: string;
    paymentLogId?: number;
    amount?: number;
    createdAt?: string;
    requestData?: string;
}
interface Ticket{
    id: number;
    title: string;
    description: string;
}

interface TicketResponse {
    ticket: Ticket;
}

export function CreateTicketPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [ticketType, setTicketType] = useState<string>(
        state?.courseId ? "course" : state?.transactionId ? "payment" : "other"
    );
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const ticketTypes = [
        { value: "course", label: "Khóa học", icon: <BookOpen className="w-4 h-4" /> },
        { value: "payment", label: "Thanh toán", icon: <DollarSign className="w-4 h-4" /> },
        { value: "instructor", label: "Giảng viên", icon: <User className="w-4 h-4" /> },
        { value: "platform", label: "Nền tảng", icon: <Layout className="w-4 h-4" /> },
        { value: "account", label: "Tài khoản", icon: <Key className="w-4 h-4" /> },
        { value: "other", label: "Khác", icon: <AlertCircle className="w-4 h-4" /> },
    ];

    const isSubmitDisabled =
        !title.trim() ||
        !description.trim() ||
        (ticketType === "course" && !state?.courseId) ||
        (ticketType === "payment" && (!state?.transactionId || !state?.paymentLogId));

    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setTicketType(state?.courseId ? "course" : state?.transactionId ? "payment" : "other");
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitDisabled) return;
        setError(null);
        setLoading(true);

        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const payload: any = {
            userType: "STUDENT",
            ticketType,
            title,
            description,
        };

        if (ticketType === "course" && state?.courseId) {
            payload.courseId = state.courseId;
        }
        if (ticketType === "payment" && state?.transactionId) {
            payload.transactionId = state.transactionId;
            payload.paymentLogId = state.paymentLogId;
        }

        try {
            const response = await requestPostWithAuth<TicketResponse>(ENDPOINTS.TICKET.CREATE, payload);
            if (response && response.ticket && response.ticket.id) {
                setShowSuccessModal(true);
                resetForm();
                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigate("/create-ticket");
                }, 3000); // Modal displays for 3 seconds
            } else {
                setError("Không thể gửi ticket. Vui lòng thử lại sau.");
            }
        } catch (err) {
            console.error("Error creating ticket:", err);
            setError("Không thể gửi ticket. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const renderItems = (requestData?: string) => {
        if (!requestData) return null;
        try {
            const data = JSON.parse(requestData);
            const items: PaymentItem[] = data.items || [];
            return items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
                    <img
                        src={item.imageUrl || `https://placehold.co/160x90?text=${encodeURIComponent(item.title)}`}
    alt={item.title}
className="w-20 h-auto aspect-[16/9] object-cover rounded-md"
    />
    <div className="flex-1">
    <p className="text-sm font-medium text-gray-900">{item.title}</p>
<p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
</div>
</div>
));
} catch (err) {
    return <div className="text-sm text-gray-500">Không thể hiển thị sản phẩm</div>;
}
};

const renderInfoPanel = () => {
    if (ticketType === "course") {
        if (state?.courseId && state?.courseName) {
            return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin khóa học</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Tên khóa học</label>
                            <p className="mt-1 text-base text-gray-900">{state.courseName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">ID khóa học</label>
                            <p className="mt-1 text-base text-gray-900">{state.courseId}</p>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Chọn khóa học để gửi yêu cầu
                </h3>
                <p className="text-gray-600 mb-4">
                    Bạn hãy chọn một khoá học bất kỳ, sau đó nhấn vào nút Hỗ trợ trong phần chi tiết để được tư vấn và hỗ trợ nhanh chóng nhé!
                </p>
            </div>
        );
    }
    if (ticketType === "payment") {
        if (state?.transactionId) {
            return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full overflow-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin hóa đơn</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Mã giao dịch</label>
                            <p className="mt-1 text-base text-gray-900">{state.transactionId}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Tổng tiền</label>
                            <p className="mt-1 text-base text-gray-900">{formatCurrency(state.amount || 0)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Ngày tạo</label>
                            <p className="mt-1 text-base text-gray-900">
                                {state.createdAt ? new Date(state.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Khóa học</label>
                            <div className="mt-2">{renderItems(state.requestData)}</div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Chọn hóa đơn để gửi yêu cầu
                </h3>
                <p className="text-gray-600 mb-4">
                    Vui lòng truy cập danh sách hóa đơn và nhấn "Yêu cầu hỗ trợ" để chọn hóa đơn.
                </p>
                <Link
                    to="/history"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Xem danh sách hóa đơn
                </Link>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                {ticketTypes.find((t) => t.value === ticketType)?.icon}
                <h3 className="text-lg font-semibold text-gray-900">
                    {ticketTypes.find((t) => t.value === ticketType)?.label}
                </h3>
            </div>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
                {ticketType === "instructor" && (
                    <>
                        <li>Liên quan đến giảng viên, nội dung bài giảng hoặc phương pháp giảng dạy.</li>
                        <li>Chúng tôi sẽ phối hợp với đội ngũ chuyên môn để hỗ trợ bạn.</li>
                    </>
                )}
                {ticketType === "platform" && (
                    <>
                        <li>Sự cố kỹ thuật, lỗi giao diện hoặc chức năng của nền tảng.</li>
                        <li>Đội ngũ kỹ thuật sẽ xử lý để đảm bảo trải nghiệm học tập ổn định.</li>
                    </>
                )}
                {ticketType === "account" && (
                    <>
                        <li>Vấn đề về tài khoản: đăng nhập, bảo mật hoặc quyền truy cập.</li>
                        <li>Thông tin của bạn được bảo mật tuyệt đối.</li>
                    </>
                )}
                {!["instructor", "platform", "account"].includes(ticketType) && (
                    <>
                        <li>Các vấn đề khác không thuộc các danh mục trên.</li>
                        <li>Chúng tôi sẽ chuyển tiếp yêu cầu đến bộ phận phù hợp.</li>
                    </>
                )}
            </ul>
        </div>
    );
};

return (
    <SearchHeaderAndFooterLayout>
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Headphones className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Gửi yêu cầu hỗ trợ</h1>
                    </div>
                    <Link
                        to="/tickets"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        {/*<ChevronLeft className="w-4 h-4 mr-1" />*/}
                        Lịch sử Yêu cầu hỗ trợ
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:max-h-[calc(100vh-200px)]">{renderInfoPanel()}</div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Loại yêu cầu
                                </label>
                                <div className="relative">
                                    <select
                                        value={ticketType}
                                        onChange={(e) => setTicketType(e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base py-3 px-4 pr-10 transition-colors appearance-none"
                                        disabled={loading}
                                    >
                                        {ticketTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Tiêu đề <span className="text-red-600">(*)</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base py-3 px-4 transition-colors"
                                    placeholder="Nhập tiêu đề yêu cầu"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Mô tả chi tiết <span className="text-red-600">(*)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base py-3 px-4 transition-colors"
                                    rows={8}
                                    placeholder="Mô tả vấn đề bạn đang gặp phải"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || isSubmitDisabled}
                                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                                        loading || isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {loading ? (
                                        <svg
                                            className="w-5 h-5 mr-2 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8H4z"
                                            />
                                        </svg>
                                    ) : (
                                        <Send className="w-5 h-5 mr-2" />
                                    )}
                                    Gửi yêu cầu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Gửi yêu cầu thành công!</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Ticket của bạn đã được gửi thành công. Vui lòng chờ admin xử lý yêu cầu. Chúng tôi sẽ phản hồi trong thời gian sớm nhất!
                    </p>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        )}
    </SearchHeaderAndFooterLayout>
);
}