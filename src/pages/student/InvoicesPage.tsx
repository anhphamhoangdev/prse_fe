import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { getWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";

interface PaymentItem {
    id: number;
    courseId: number;
    title: string;
    price: number;
    imageUrl?: string;
}

interface PaymentRequest {
    id: number;
    checkoutDraftId: number;
    studentId: number;
    paymentMethodCode: string;
    point: number | null;
    amount: number;
    status: "NEW" | "PAID" | "CANCELLED";
    transactionId: string;
    requestData: string;
    responseData: string;
    createdAt: string;
    updatedAt: string;
}

interface PaymentResponseData {
    paymentRequestLogEntities: PaymentRequest[];
}

export function InvoicesPage() {
    const [invoices, setInvoices] = useState<PaymentRequest[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState<"all" | "paid" | "processing" | "cancelled">("all");
    const [stats, setStats] = useState({
        all: 0,
        paid: 0,
        processing: 0,
        cancelled: 0
    });
    const [expandedInvoice, setExpandedInvoice] = useState<number | null>(null);

    const itemsPerPage = 10;

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await getWithAuth<PaymentResponseData>(ENDPOINTS.PAYMENT.GET_ALL);

            const data = response.paymentRequestLogEntities || [];
            setInvoices(data);
            // Calculate stats
            setStats({
                all: data.length,
                paid: data.filter(inv => inv.status === "PAID").length,
                processing: data.filter(inv => inv.status === "NEW").length,
                cancelled: data.filter(inv => inv.status === "CANCELLED").length
            });

            // Initialize filtered invoices (all invoices by default)
            setFilteredInvoices(data);
            setTotalPages(Math.ceil(data.length / itemsPerPage) || 1);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching invoices:", err);
            setError("Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.");
            setInvoices([]);
            setFilteredInvoices([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    useEffect(() => {
        // Filter invoices by active tab
        const filtered = invoices.filter(inv => {
            if (activeTab === "all") return true;
            if (activeTab === "paid") return inv.status === "PAID";
            if (activeTab === "processing") return inv.status === "NEW";
            if (activeTab === "cancelled") return inv.status === "CANCELLED";
            return true;
        });

        setFilteredInvoices(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
        setCurrentPage(1);
    }, [activeTab, invoices]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTabChange = (tab: "all" | "paid" | "processing" | "cancelled") => {
        setActiveTab(tab);
    };

    const toggleInvoiceDetails = (invoiceId: number) => {
        setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
    };

    const tabsConfig = [
        {
            id: "all",
            label: "Tất cả",
            icon: "fa-th-large",
            color: "from-blue-500 to-blue-700",
            description: "Tất cả các hóa đơn"
        },
        {
            id: "paid",
            label: "Đã thanh toán",
            icon: "fa-check-circle",
            color: "from-green-500 to-emerald-600",
            description: "Các hóa đơn đã thanh toán thành công"
        },
        {
            id: "processing",
            label: "Đang xử lý",
            icon: "fa-spinner",
            color: "from-cyan-500 to-cyan-600",
            description: "Các hóa đơn đang chờ xử lý"
        },
        {
            id: "cancelled",
            label: "Đã hủy",
            icon: "fa-times-circle",
            color: "from-red-500 to-red-600",
            description: "Các hóa đơn đã bị hủy"
        }
    ];

    const currentTab = tabsConfig.find(tab => tab.id === activeTab) || tabsConfig[0];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    const renderItems = (requestData: string) => {
        try {
            const data = JSON.parse(requestData);
            const items: PaymentItem[] = data.items || [];
            return items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
                    <img
                        src={item.imageUrl || `https://placehold.co/160x90?text=${encodeURIComponent(item.title)}`}
                        alt={item.title}
                        className="w-32 sm:w-40 h-auto aspect-[16/9] object-cover rounded-md"
                    />
                    <div className="flex-1">
                        <a
                            href={`https://prse-fe.vercel.app/course-detail/${item.courseId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-semibold text-blue-700 hover:text-blue-900"
                        >
                            {item.title}
                        </a>
                        <p className="text-base font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                    </div>
                </div>
            ));
        } catch (err) {
            return <div className="text-sm text-gray-500">Không thể hiển thị sản phẩm</div>;
        }
    };

    // Paginate filtered invoices
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <SearchHeaderAndFooterLayout>
            <div className="min-h-screen bg-gray-50 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Hóa đơn của tôi</h1>
                        <Link
                            to="/courses"
                            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300 shadow-sm"
                        >
                            Xem các khóa học
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {tabsConfig.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    className={`relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                                        isActive
                                            ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                                            : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow text-gray-700"
                                    }`}
                                    onClick={() => handleTabChange(tab.id as "all" | "paid" | "processing" | "cancelled")}
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                                                isActive ? "bg-white/20" : `bg-gradient-to-r ${tab.color} bg-opacity-10 text-white`
                                            }`}
                                        >
                                            <i className={`fas ${tab.icon} ${isActive ? "text-white" : ""}`}></i>
                                        </div>
                                        <span className="font-medium ml-3">{tab.label}</span>
                                    </div>
                                    <div
                                        className={`h-6 w-6 flex items-center justify-center rounded-full ${
                                            isActive ? "bg-white text-blue-600" : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {stats[tab.id as keyof typeof stats] || 0}
                                    </div>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-1">
                                            <div className="h-1.5 w-10 rounded-full bg-white"></div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="relative h-16 w-16 mb-4">
                                <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
                                <div className="absolute inset-3 rounded-full border-2 border-gray-200"></div>
                            </div>
                            <p className="text-blue-600 text-lg font-medium">Đang tải danh sách hóa đơn...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center shadow-sm">
                            <div className="mb-3">
                                <i className="fas fa-exclamation-circle text-3xl text-red-500"></i>
                            </div>
                            <h3 className="text-lg font-medium mb-2">Đã xảy ra lỗi</h3>
                            <p>{error}</p>
                            <button
                                onClick={fetchInvoices}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                            >
                                <i className="fas fa-redo mr-2"></i> Thử lại
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredInvoices.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-50 mb-6">
                                <i
                                    className={`fas ${currentTab.icon} text-4xl ${
                                        activeTab === "paid"
                                            ? "text-green-500"
                                            : activeTab === "processing"
                                                ? "text-blue-500"
                                                : activeTab === "cancelled"
                                                    ? "text-red-500"
                                                    : "text-indigo-500"
                                    }`}
                                ></i>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-3">
                                {activeTab === "all"
                                    ? "Bạn chưa có hóa đơn nào"
                                    : activeTab === "paid"
                                        ? "Bạn chưa có hóa đơn nào đã thanh toán"
                                        : activeTab === "processing"
                                            ? "Bạn không có hóa đơn nào đang xử lý"
                                            : "Bạn không có hóa đơn nào bị hủy"}
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                {activeTab === "all"
                                    ? "Hãy khám phá các khóa học và bắt đầu mua sắm."
                                    : activeTab === "paid"
                                        ? "Hoàn thành thanh toán để xem hóa đơn ở đây."
                                        : activeTab === "processing"
                                            ? "Không có hóa đơn nào đang chờ xử lý."
                                            : "Không có hóa đơn nào bị hủy."}
                            </p>
                            <Link
                                to="/courses"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <i className="fas fa-search mr-2"></i> Khám phá khóa học ngay
                            </Link>
                        </div>
                    )}

                    {/* Invoices List */}
                    {!loading && !error && filteredInvoices.length > 0 && (
                        <>
                            <div className="flex flex-col gap-6">
                                {paginatedInvoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition duration-300"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{invoice.transactionId}</h3>
                                            <span
                                                className={`px-4 py-1.5 text-sm font-semibold rounded-full mt-2 sm:mt-0 ${
                                                    invoice.status === "PAID"
                                                        ? "bg-green-200 text-green-900"
                                                        : invoice.status === "NEW"
                                                            ? "bg-blue-200 text-blue-900"
                                                            : "bg-red-200 text-red-900"
                                                }`}
                                            >
                                                {invoice.status === "PAID"
                                                    ? "Đã thanh toán"
                                                    : invoice.status === "NEW"
                                                        ? "Đang xử lý"
                                                        : "Đã hủy"}
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-500">
                                                Tổng tiền:{" "}
                                                <span className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(invoice.amount)}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Ngày tạo:{" "}
                                                <span className="font-medium">
                                                    {new Date(invoice.createdAt).toLocaleDateString("vi-VN")}
                                                </span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleInvoiceDetails(invoice.id)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                        >
                                            {expandedInvoice === invoice.id ? (
                                                <>
                                                    <i className="fas fa-chevron-up mr-2"></i> Ẩn chi tiết
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-chevron-down mr-2"></i> Xem chi tiết
                                                </>
                                            )}
                                        </button>
                                        {expandedInvoice === invoice.id && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Khóa học:</h4>
                                                <div className="space-y-2">{renderItems(invoice.requestData)}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="inline-flex rounded-md shadow-sm">
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-l-lg border ${
                                                currentPage === 1
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                                    : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
                                            }`}
                                        >
                                            <i className="fas fa-angle-double-left"></i>
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 border-t border-b ${
                                                currentPage === 1
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                                    : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
                                            }`}
                                        >
                                            <i className="fas fa-angle-left"></i>
                                        </button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            if (pageNum > 0 && pageNum <= totalPages) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-4 py-2 border-t border-b ${
                                                            currentPage === pageNum
                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 border-t border-b ${
                                                currentPage === totalPages
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                                    : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
                                            }`}
                                        >
                                            <i className="fas fa-angle-right"></i>
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 rounded-r-lg border ${
                                                currentPage === totalPages
                                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                                    : "bg-white text-blue-600 hover:bg-blue-50 border-gray-200"
                                            }`}
                                        >
                                            <i className="fas fa-angle-double-right"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}