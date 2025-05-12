import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, Download, Filter, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { useNavigate } from 'react-router-dom';

// Định nghĩa các trạng thái thanh toán
const PAYMENT_STATUS = {
    NEW: 'NEW',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
};

// Định nghĩa kiểu dữ liệu cho hóa đơn
interface CourseItem {
    id: number;
    courseId: number;
    title: string;
    price: number;
    imageUrl?: string;
}

interface PaymentData {
    id: number;
    checkoutDraftId: number;
    studentId: number;
    paymentMethodCode: string;
    point: number | null;
    amount: number;
    status: string;
    transactionId: string;
    requestData: string;
    responseData: string;
    createdAt: string;
    updatedAt: string;
    // Thêm các trường phân tích từ requestData và responseData
    parsedItems?: CourseItem[];
    parsedResponse?: any;
}

interface ApiResponse {
    content: PaymentData[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

const InvoiceManagement = () => {
    const navigate = useNavigate();

    // State management
    const [invoices, setInvoices] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<PaymentData | null>(null);

    // Fetch invoices from API
    const fetchInvoices = async () => {
        setLoading(true);
        try {
            // Xây dựng URL với các tham số truy vấn
            let url = `${ENDPOINTS.ADMIN.INVOICE}?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;

            // Thêm các tham số lọc nếu có
            if (searchTerm) {
                url += `&transactionId=${encodeURIComponent(searchTerm)}`;
            }

            if (statusFilter !== 'ALL') {
                url += `&status=${encodeURIComponent(statusFilter)}`;
            }

            const response = await requestAdminWithAuth<ApiResponse>(url);

            if (response) {
                // Xử lý dữ liệu từ response
                const invoicesWithParsedData = response.content.map(invoice => {
                    let parsedItems: CourseItem[] = [];
                    let parsedResponse = null;

                    // Parse requestData để lấy danh sách khóa học
                    try {
                        const requestData = JSON.parse(invoice.requestData);
                        if (requestData.items) {
                            parsedItems = requestData.items;
                        }
                    } catch (e) {
                        console.error('Error parsing requestData:', e);
                    }

                    // Parse responseData để lấy thông tin thanh toán
                    try {
                        const responseData = JSON.parse(invoice.responseData);
                        parsedResponse = responseData;
                    } catch (e) {
                        console.error('Error parsing responseData:', e);
                    }

                    return {
                        ...invoice,
                        parsedItems,
                        parsedResponse
                    };
                });

                setInvoices(invoicesWithParsedData);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    // Load data on initial render and when filters change
    useEffect(() => {
        fetchInvoices();
    }, [currentPage, pageSize]);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Open invoice detail modal
    const openDetailModal = (invoice: PaymentData) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedInvoice(null);
    };

    // Apply filters and refresh data
    const applyFilters = () => {
        setCurrentPage(0); // Reset to first page when applying filters
        fetchInvoices();
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('ALL');
        setSortBy('createdAt');
        setSortDir('desc');
        setCurrentPage(0);
        // Fetch will be triggered by the useEffect
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case PAYMENT_STATUS.NEW:
                return 'bg-blue-100 text-blue-800';
            case PAYMENT_STATUS.PAID:
                return 'bg-green-100 text-green-800';
            case PAYMENT_STATUS.CANCELLED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case PAYMENT_STATUS.NEW:
                return <Clock className="w-4 h-4" />;
            case PAYMENT_STATUS.PAID:
                return <CheckCircle className="w-4 h-4" />;
            case PAYMENT_STATUS.CANCELLED:
                return <XCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-6">
            {/* Main content */}
            <div className="bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý hóa đơn</h1>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm theo mã giao dịch..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value={PAYMENT_STATUS.NEW}>Mới</option>
                        <option value={PAYMENT_STATUS.PAID}>Đã thanh toán</option>
                        <option value={PAYMENT_STATUS.CANCELLED}>Đã hủy</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="createdAt">Ngày tạo</option>
                        <option value="amount">Số tiền</option>
                        <option value="status">Trạng thái</option>
                        <option value="id">ID</option>
                    </select>
                    <select
                        value={sortDir}
                        onChange={(e) => setSortDir(e.target.value)}
                        className="p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="desc">Giảm dần</option>
                        <option value="asc">Tăng dần</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={applyFilters}
                            className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Lọc
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                {/* Invoices Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-center py-8">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã giao dịch
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Học viên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số tiền
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        #{invoice.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {invoice.transactionId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => navigate(`/admin/student/${invoice.studentId}`)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                                        >
                                            {invoice.studentId}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(invoice.amount)} VNĐ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                                    invoice.status
                                                )}`}
                                            >
                                                {getStatusIcon(invoice.status)}
                                                <span className="ml-1">
                                                    {invoice.status === PAYMENT_STATUS.NEW
                                                        ? 'Mới'
                                                        : invoice.status === PAYMENT_STATUS.PAID
                                                            ? 'Đã thanh toán'
                                                            : 'Đã hủy'}
                                                </span>
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(invoice.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => openDetailModal(invoice)}
                                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 0 && (
                            <div className="flex justify-between items-center mt-6">
                                <div className="text-sm text-gray-700">
                                    Hiển thị {invoices.length} trên tổng số {totalElements} hóa đơn
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className={`px-4 py-2 rounded ${
                                            currentPage === 0
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Trước
                                    </button>
                                    {totalPages <= 5
                                        ? [...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(i)}
                                                className={`px-4 py-2 rounded ${
                                                    currentPage === i
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))
                                        : [
                                            // Hiển thị nút trang đầu
                                            <button
                                                key="first"
                                                onClick={() => handlePageChange(0)}
                                                className={`px-4 py-2 rounded ${
                                                    currentPage === 0
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                1
                                            </button>,

                                            // Nút "..." nếu trang hiện tại > 2
                                            currentPage > 2 &&
                                            <button
                                                key="ellipsis1"
                                                className="px-4 py-2 rounded bg-gray-100 text-gray-400"
                                                disabled
                                            >
                                                ...
                                            </button>,

                                            // Trang trước trang hiện tại nếu có
                                            currentPage > 1 &&
                                            <button
                                                key={currentPage - 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                {currentPage}
                                            </button>,

                                            // Trang hiện tại (trừ khi đó là trang đầu hoặc cuối)
                                            currentPage !== 0 && currentPage !== totalPages - 1 &&
                                            <button
                                                key={currentPage}
                                                onClick={() => handlePageChange(currentPage)}
                                                className="px-4 py-2 rounded bg-blue-600 text-white"
                                            >
                                                {currentPage + 1}
                                            </button>,

                                            // Trang sau trang hiện tại nếu có
                                            currentPage < totalPages - 2 &&
                                            <button
                                                key={currentPage + 1}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                {currentPage + 2}
                                            </button>,

                                            // Nút "..." nếu trang hiện tại < totalPages - 3
                                            currentPage < totalPages - 3 &&
                                            <button
                                                key="ellipsis2"
                                                className="px-4 py-2 rounded bg-gray-100 text-gray-400"
                                                disabled
                                            >
                                                ...
                                            </button>,

                                            // Hiển thị nút trang cuối
                                            <button
                                                key="last"
                                                onClick={() => handlePageChange(totalPages - 1)}
                                                className={`px-4 py-2 rounded ${
                                                    currentPage === totalPages - 1
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {totalPages}
                                            </button>
                                        ].filter(Boolean) // Lọc bỏ các phần tử null/undefined
                                    }
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className={`px-4 py-2 rounded ${
                                            currentPage === totalPages - 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal for viewing invoice details */}
            {isModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden transform transition-all duration-300 scale-100 animate-in">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Download className="w-6 h-6" />
                                    Chi tiết hóa đơn #{selectedInvoice.id}
                                </h2>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedInvoice.status === PAYMENT_STATUS.NEW
                                        ? 'bg-blue-500 text-white'
                                        : selectedInvoice.status === PAYMENT_STATUS.PAID
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                }`}>
                                    {getStatusIcon(selectedInvoice.status)}
                                    <span className="ml-1.5">
                                        {selectedInvoice.status === PAYMENT_STATUS.NEW
                                            ? 'Mới'
                                            : selectedInvoice.status === PAYMENT_STATUS.PAID
                                                ? 'Đã thanh toán'
                                                : 'Đã hủy'}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-6">
                                {/* Invoice information section */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Thông tin giao dịch</h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-32">Mã giao dịch:</span>
                                                <span className="text-sm text-gray-900">{selectedInvoice.transactionId}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-32">Học viên:</span>
                                                <button
                                                    onClick={() => navigate(`/admin/student/${selectedInvoice.studentId}`)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                                                >
                                                    {selectedInvoice.studentId}
                                                </button>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-32">Phương thức thanh toán:</span>
                                                <span className="text-sm text-gray-900">{selectedInvoice.paymentMethodCode}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-32">Số tiền:</span>
                                                <span className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedInvoice.amount)} VNĐ</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-32">Ngày tạo:</span>
                                                <span className="text-sm text-gray-900">{formatDate(selectedInvoice.createdAt)}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-32">Cập nhật lần cuối:</span>
                                                <span className="text-sm text-gray-900">{formatDate(selectedInvoice.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Courses list section */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Danh sách khóa học</h3>
                                    </div>
                                    <div className="p-4">
                                        {selectedInvoice.parsedItems && selectedInvoice.parsedItems.length > 0 ? (
                                            <div className="space-y-4">
                                                {selectedInvoice.parsedItems.map((item, index) => (
                                                    <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                                        {item.imageUrl && (
                                                            <div className="w-16 h-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <span className="text-xs text-gray-500">Mã khóa học: {item.courseId}</span>
                                                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)} VNĐ</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                Không có thông tin về khóa học
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payment information */}
                                {selectedInvoice.parsedResponse && selectedInvoice.parsedResponse.payment_info && (
                                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                            <h3 className="font-semibold text-gray-800">Thông tin thanh toán</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedInvoice.parsedResponse.payment_info.accountNumber && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-sm font-medium text-gray-500 min-w-32">Số tài khoản:</span>
                                                        <span className="text-sm text-gray-900">{selectedInvoice.parsedResponse.payment_info.accountNumber}</span>
                                                    </div>
                                                )}
                                                {selectedInvoice.parsedResponse.payment_info.accountName && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-sm font-medium text-gray-500 min-w-32">Tên tài khoản:</span>
                                                        <span className="text-sm text-gray-900">{selectedInvoice.parsedResponse.payment_info.accountName}</span>
                                                    </div>
                                                )}
                                                {selectedInvoice.parsedResponse.payment_info.description && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-sm font-medium text-gray-500 min-w-32">Mô tả:</span>
                                                        <span className="text-sm text-gray-900">{selectedInvoice.parsedResponse.payment_info.description}</span>
                                                    </div>
                                                )}
                                                {selectedInvoice.parsedResponse.payment_info.checkoutUrl && (
                                                    <div className="flex items-start gap-2 col-span-2">
                                                        <span className="text-sm font-medium text-gray-500 min-w-32">URL thanh toán:</span>
                                                        <a
                                                            href={selectedInvoice.parsedResponse.payment_info.checkoutUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            {selectedInvoice.parsedResponse.payment_info.checkoutUrl}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}


                            </div>
                        </div>

                        {/* Modal footer with action buttons */}
                        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceManagement;