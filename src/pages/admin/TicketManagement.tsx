import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, MessageSquare, Check, Clock } from 'lucide-react';
import { putAdminWithAuth, requestAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {useNavigate} from "react-router-dom";

// Define ticket status types
const TICKET_STATUS = {
    NEW: 'NEW',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
};

// Define ticket types
const TICKET_TYPES = {
    COURSE: 'course',
    INSTRUCTOR: 'instructor',
    PLATFORM: 'platform',
    PAYMENT: 'payment',
    ACCOUNT: 'account',
    OTHER: 'other',
};

interface TicketData {
    id: number;
    userId: number;
    userType: string;
    ticketType: string;
    courseId: number | null;
    paymentLogId: number | null;
    title: string;
    description: string;
    attachmentUrl: string | null;
    status: string;
    response: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
}

interface ApiResponse {
    tickets: TicketData[];
}

const TicketManagement = () => {
    // State management
    const [allTickets, setAllTickets] = useState<TicketData[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<string>('ALL');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
    const [ticketResponse, setTicketResponse] = useState('');
    const [ticketStatus, setTicketStatus] = useState('');

    // navigate
    const navigate = useNavigate();


    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const response = await requestAdminWithAuth<ApiResponse>(
                    `${ENDPOINTS.ADMIN.TICKETS}`
                );
                if (response.tickets) {
                    setAllTickets(response.tickets);
                    setFilteredTickets(response.tickets);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // Apply filters to tickets
    useEffect(() => {
        let result = [...allTickets];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                (ticket) =>
                    ticket.title.toLowerCase().includes(search) ||
                    ticket.description.toLowerCase().includes(search)
            );
        }

        if (statusFilter !== 'ALL') {
            result = result.filter((ticket) => ticket.status === statusFilter);
        }

        if (typeFilter !== 'ALL') {
            result = result.filter((ticket) => ticket.ticketType === typeFilter);
        }

        if (activeTab !== 'ALL') {
            if (Object.values(TICKET_STATUS).includes(activeTab)) {
                result = result.filter((ticket) => ticket.status === activeTab);
            } else if (Object.values(TICKET_TYPES).includes(activeTab)) {
                result = result.filter((ticket) => ticket.ticketType === activeTab);
            }
        }

        setFilteredTickets(result);
    }, [allTickets, searchTerm, statusFilter, typeFilter, activeTab]);

    const openEditModal = (ticket: TicketData) => {
        setSelectedTicket(ticket);
        setTicketResponse(ticket.response || '');
        setTicketStatus(ticket.status);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
    };

    const saveTicketChanges = async () => {
        if (!selectedTicket) return;

        try {
            setLoading(true);

            const responseData = await putAdminWithAuth<{tickets: TicketData}>(
                `${ENDPOINTS.ADMIN.TICKETS}/${selectedTicket.id}`,
                {
                    response: ticketResponse,
                    status: ticketStatus,
                }
            );

            if (responseData && responseData.tickets) {
                const updatedTicketFromServer = responseData.tickets;

                setAllTickets(
                    allTickets.map((ticket) =>
                        ticket.id === selectedTicket.id ? updatedTicketFromServer : ticket
                    )
                );

                closeModal();
            } else {
                throw new Error('Dữ liệu phản hồi không hợp lệ');
            }
        } catch (err) {
            // Xử lý lỗi
            setError(err instanceof Error ? err.message : 'Không thể cập nhật yêu cầu');
        } finally {
            // Kết thúc trạng thái loading
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case TICKET_STATUS.NEW:
                return 'bg-blue-100 text-blue-800';
            case TICKET_STATUS.IN_PROGRESS:
                return 'bg-yellow-100 text-yellow-800';
            case TICKET_STATUS.RESOLVED:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case TICKET_TYPES.COURSE:
                return 'Khóa học';
            case TICKET_TYPES.INSTRUCTOR:
                return 'Giảng viên';
            case TICKET_TYPES.PLATFORM:
                return 'Nền tảng';
            case TICKET_TYPES.PAYMENT:
                return 'Thanh toán';
            case TICKET_TYPES.ACCOUNT:
                return 'Tài khoản';
            case TICKET_TYPES.OTHER:
                return 'Khác';
            default:
                return type;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case TICKET_STATUS.NEW:
                return <MessageSquare className="w-4 h-4" />;
            case TICKET_STATUS.IN_PROGRESS:
                return <Clock className="w-4 h-4" />;
            case TICKET_STATUS.RESOLVED:
                return <Check className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="container mx-auto p-6">
            {/* Main content */}
            <div className="bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý yêu cầu hỗ trợ</h1>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
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
                        <option value={TICKET_STATUS.NEW}>Mới</option>
                        <option value={TICKET_STATUS.IN_PROGRESS}>Đang xử lý</option>
                        <option value={TICKET_STATUS.RESOLVED}>Đã giải quyết</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="p-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="ALL">Tất cả loại</option>
                        {Object.values(TICKET_TYPES).map((type) => (
                            <option key={type} value={type}>
                                {getTypeLabel(type)}
                            </option>
                        ))}
                    </select>
                </div>



                {/* Tickets Table */}
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
                                    Tiêu đề
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
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
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        #{ticket.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {ticket.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getTypeLabel(ticket.ticketType)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                                    ticket.status
                                                )}`}
                                            >
                                                {getStatusIcon(ticket.status)}
                                                <span className="ml-1">
                                                    {ticket.status === TICKET_STATUS.NEW
                                                        ? 'Mới'
                                                        : ticket.status === TICKET_STATUS.IN_PROGRESS
                                                            ? 'Đang xử lý'
                                                            : 'Đã giải quyết'}
                                                </span>
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(ticket.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => openEditModal(ticket)}
                                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                        >
                                            Xem
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for editing ticket - Enhanced version */}
            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden transform transition-all duration-300 scale-100 animate-in">
                        {/* Modal Header with more visual prominence */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="w-6 h-6" />
                                    Yêu cầu #{selectedTicket.id}
                                </h2>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedTicket.status === TICKET_STATUS.NEW
                                        ? 'bg-blue-500 text-white'
                                        : selectedTicket.status === TICKET_STATUS.IN_PROGRESS
                                            ? 'bg-yellow-400 text-gray-900'
                                            : 'bg-green-500 text-white'
                                }`}>
                        {getStatusIcon(selectedTicket.status)}
                                    <span className="ml-1.5">
                            {selectedTicket.status === TICKET_STATUS.NEW
                                ? 'Mới'
                                : selectedTicket.status === TICKET_STATUS.IN_PROGRESS
                                    ? 'Đang xử lý'
                                    : 'Đã giải quyết'}
                        </span>
                    </span>
                            </div>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-6">
                                {/* Request information section */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Thông tin yêu cầu</h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-24">Người gửi:</span>
                                                <span className="text-sm text-gray-900">
                                        User ID: {' '}
                                                    <button
                                                        onClick={() => navigate(`/admin/student/${selectedTicket.userId}`)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                                                    >
                                            {selectedTicket.userId}
                                        </button> ({selectedTicket.userType})
                                    </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-24">Loại yêu cầu:</span>
                                                <span className="text-sm text-gray-900">
                                        {getTypeLabel(selectedTicket.ticketType)}
                                    </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-24">Ngày tạo:</span>
                                                <span className="text-sm text-gray-900">
                                        {formatDate(selectedTicket.createdAt)}
                                    </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-gray-500 min-w-24">Cập nhật:</span>
                                                <span className="text-sm text-gray-900">
                                        {formatDate(selectedTicket.updatedAt)}
                                    </span>
                                            </div>
                                            {selectedTicket.courseId && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-sm font-medium text-gray-500 min-w-24">ID Khóa học:</span>
                                                    <span className="text-sm text-gray-900">{selectedTicket.courseId}</span>
                                                </div>
                                            )}
                                            {selectedTicket.paymentLogId && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-sm font-medium text-gray-500 min-w-24">ID Thanh toán:</span>
                                                    <span className="text-sm text-gray-900">{selectedTicket.paymentLogId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Separate title and description as requested */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Tiêu đề yêu cầu</h3>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-medium text-gray-900 text-lg">{selectedTicket.title}</h4>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Nội dung yêu cầu</h3>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {selectedTicket.description}
                                        </p>
                                        {selectedTicket.attachmentUrl && (
                                            <div className="mt-4 flex items-center">
                                                <a
                                                    href={selectedTicket.attachmentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors text-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                        <polyline points="7 10 12 15 17 10"></polyline>
                                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                                    </svg>
                                                    Tệp đính kèm
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Response textarea with improved styling */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Phản hồi của bạn</h3>
                                    </div>
                                    <div className="p-4">
                            <textarea
                                value={ticketResponse}
                                onChange={(e) => setTicketResponse(e.target.value)}
                                rows={5}
                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-700"
                                placeholder="Nhập phản hồi chi tiết cho yêu cầu này..."
                            />
                                    </div>
                                </div>

                                {/* Status selector - Conditionally displayed based on current status */}
                                {selectedTicket.status !== TICKET_STATUS.RESOLVED && (
                                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                            <h3 className="font-semibold text-gray-800">Cập nhật trạng thái</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex flex-col md:flex-row gap-4">
                                                {selectedTicket.status === TICKET_STATUS.NEW && (
                                                    <>
                                                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                                                            ticketStatus === TICKET_STATUS.IN_PROGRESS
                                                                ? 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-200'
                                                                : 'border-gray-200 hover:bg-gray-50'
                                                        }`}>
                                                            <input
                                                                type="radio"
                                                                name="status"
                                                                value={TICKET_STATUS.IN_PROGRESS}
                                                                checked={ticketStatus === TICKET_STATUS.IN_PROGRESS}
                                                                onChange={(e) => setTicketStatus(e.target.value)}
                                                                className="mr-2 text-yellow-600 focus:ring-yellow-500"
                                                            />
                                                            <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                                                            <span>Đang xử lý</span>
                                                        </label>

                                                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                                                            ticketStatus === TICKET_STATUS.RESOLVED
                                                                ? 'bg-green-50 border-green-500 ring-2 ring-green-200'
                                                                : 'border-gray-200 hover:bg-gray-50'
                                                        }`}>
                                                            <input
                                                                type="radio"
                                                                name="status"
                                                                value={TICKET_STATUS.RESOLVED}
                                                                checked={ticketStatus === TICKET_STATUS.RESOLVED}
                                                                onChange={(e) => setTicketStatus(e.target.value)}
                                                                className="mr-2 text-green-600 focus:ring-green-500"
                                                            />
                                                            <Check className="w-4 h-4 mr-2 text-green-600" />
                                                            <span>Đã giải quyết</span>
                                                        </label>
                                                    </>
                                                )}

                                                {selectedTicket.status === TICKET_STATUS.IN_PROGRESS && (
                                                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                                                        ticketStatus === TICKET_STATUS.RESOLVED
                                                            ? 'bg-green-50 border-green-500 ring-2 ring-green-200'
                                                            : 'border-gray-200 hover:bg-gray-50'
                                                    }`}>
                                                        <input
                                                            type="radio"
                                                            name="status"
                                                            value={TICKET_STATUS.RESOLVED}
                                                            checked={ticketStatus === TICKET_STATUS.RESOLVED}
                                                            onChange={(e) => setTicketStatus(e.target.value)}
                                                            className="mr-2 text-green-600 focus:ring-green-500"
                                                        />
                                                        <Check className="w-4 h-4 mr-2 text-green-600" />
                                                        <span>Đã giải quyết</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal footer with improved styling */}
                        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={saveTicketChanges}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketManagement;