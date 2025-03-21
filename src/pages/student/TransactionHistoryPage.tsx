import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { Clock, CreditCard, FileText, AlertCircle, ReceiptText, ChevronRight, CheckCircle, XCircle, Search, Calendar, Filter, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from "../../utils/formatCurrency";
import { requestWithAuth } from "../../utils/request";
import { formatDate, formatTime } from "../../utils/formatLocalDateTimeToVN";

interface Transaction {
    id: number;
    transaction_id: string;
    student_id: number;
    amount: number;
    point: number;
    created_at: string;
    payment_method_code: string;
    status: string;
    checkout_draft_id: number;
}

interface TransactionHistoryResponse {
    code: number;
    data: {
        transactions: Transaction[];
    };
    error_message?: string;
}

export function TransactionHistoryPage() {
    // State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest, highest, lowest
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const itemsPerPage = 10; // Số lượng hiển thị mỗi trang
    const navigate = useNavigate();

    // Fetch transactions
    // useEffect(() => {
    //     const fetchAllTransactions = async () => {
    //         try {
    //             setLoading(true);
    //             setIsSearching(searchTerm.trim() !== '');
    //
    //             let endpoint = '/payment/history/all';
    //             if (searchTerm.trim() !== '') {
    //                 endpoint += `?search=${encodeURIComponent(searchTerm.trim())}`;
    //             }
    //
    //             const response = await requestWithAuth<TransactionHistoryResponse>(endpoint);
    //
    //             if (response && response.data && response.data.transactions) {
    //                 setTransactions(response.data.transactions);
    //             } else {
    //                 setError('Dữ liệu không hợp lệ');
    //             }
    //         } catch (error) {
    //             setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải lịch sử giao dịch');
    //         } finally {
    //             setLoading(false);
    //             setIsSearching(false);
    //         }
    //     };
    //
    //     // Debounce: đợi 500ms sau khi người dùng ngừng gõ
    //     const timer = setTimeout(() => {
    //         fetchAllTransactions();
    //     }, 500);
    //
    //     // Clear timeout khi searchTerm thay đổi để tránh gọi API nhiều lần
    //     return () => clearTimeout(timer);
    // }, [searchTerm]);

    // Mock data for example
    useEffect(() => {
        // In a real app, use fetchTransactions() instead
        // For this example, we'll simulate with mock data
        setLoading(true);
        setTimeout(() => {
            const mockTransactions = [
                {
                    id: 1,
                    transaction_id: "TX78901234",
                    student_id: 39,
                    amount: 440000,
                    point: 0,
                    created_at: "2025-03-17 14:30:10.859809",
                    payment_method_code: "BANK_TRANSFER",
                    status: "PAID",
                    checkout_draft_id: 118
                },
                {
                    id: 2,
                    transaction_id: "TX78901235",
                    student_id: 39,
                    amount: 190000,
                    point: 0,
                    created_at: "2025-03-15 10:25:15.214365",
                    payment_method_code: "MOMO",
                    status: "PAID",
                    checkout_draft_id: 119
                },
                {
                    id: 3,
                    transaction_id: "TX78901236",
                    student_id: 39,
                    amount: 150000,
                    point: 0,
                    created_at: "2025-03-18 09:15:22.756123",
                    payment_method_code: "ZALOPAY",
                    status: "NEW",
                    checkout_draft_id: 120
                },
                {
                    id: 4,
                    transaction_id: "TX78901237",
                    student_id: 39,
                    amount: 50000,
                    point: 0,
                    created_at: "2025-03-16 16:45:05.123987",
                    payment_method_code: "VNPAY",
                    status: "CANCELLED",
                    checkout_draft_id: 121
                },
                {
                    id: 5,
                    transaction_id: "TX78901238",
                    student_id: 39,
                    amount: 100000,
                    point: 0,
                    created_at: "2025-03-14 11:30:42.654321",
                    payment_method_code: "BANK_TRANSFER",
                    status: "CANCELLED",
                    checkout_draft_id: 122
                },
                {
                    id: 6,
                    transaction_id: "TX78901239",
                    student_id: 39,
                    amount: 250000,
                    point: 10,
                    created_at: "2025-03-13 08:22:18.987654",
                    payment_method_code: "MOMO",
                    status: "PAID",
                    checkout_draft_id: 123
                },
                {
                    id: 7,
                    transaction_id: "TX78901240",
                    student_id: 39,
                    amount: 320000,
                    point: 0,
                    created_at: "2025-03-12 13:10:55.543210",
                    payment_method_code: "BANK_TRANSFER",
                    status: "PAID",
                    checkout_draft_id: 124
                },
                {
                    id: 8,
                    transaction_id: "TX78901241",
                    student_id: 39,
                    amount: 75000,
                    point: 5,
                    created_at: "2025-03-11 15:42:33.876543",
                    payment_method_code: "VNPAY",
                    status: "CANCELLED",
                    checkout_draft_id: 125
                },
                {
                    id: 9,
                    transaction_id: "TX78901242",
                    student_id: 39,
                    amount: 180000,
                    point: 0,
                    created_at: "2025-03-10 09:35:28.234567",
                    payment_method_code: "ZALOPAY",
                    status: "NEW",
                    checkout_draft_id: 126
                },
                {
                    id: 10,
                    transaction_id: "TX78901243",
                    student_id: 39,
                    amount: 420000,
                    point: 15,
                    created_at: "2025-03-09 17:18:47.765432",
                    payment_method_code: "BANK_TRANSFER",
                    status: "PAID",
                    checkout_draft_id: 127
                },
                {
                    id: 11,
                    transaction_id: "TX78901244",
                    student_id: 39,
                    amount: 95000,
                    point: 0,
                    created_at: "2025-03-08 11:05:39.234517",
                    payment_method_code: "MOMO",
                    status: "PAID",
                    checkout_draft_id: 128
                },
                {
                    id: 12,
                    transaction_id: "TX78901245",
                    student_id: 39,
                    amount: 350000,
                    point: 0,
                    created_at: "2025-03-07 14:52:21.876123",
                    payment_method_code: "BANK_TRANSFER",
                    status: "CANCELLED",
                    checkout_draft_id: 129
                }
            ];
            setTransactions(mockTransactions);
            setLoading(false);
        }, 1500);
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, sortOrder, searchTerm]);

    // Components
    const EmptyTransactions = () => (
        <div className="text-center py-16">
            <div className="flex justify-center mb-6">
                <ReceiptText className="w-24 h-24 text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                Chưa có giao dịch nào
            </h2>
            <p className="text-gray-500 mb-6">
                Hãy khám phá các khóa học hấp dẫn của chúng tôi
            </p>
            <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full
                     font-medium shadow-lg hover:shadow-blue-500/30 transition-all duration-300
                     hover:-translate-y-0.5 active:translate-y-0"
            >
                Khám phá ngay
            </button>
        </div>
    );

    const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
        // Get payment method display name
        const getPaymentMethod = (code: string) => {
            const methods: Record<string, string> = {
                'BANK_TRANSFER': 'Chuyển khoản ngân hàng',
                'MOMO': 'Ví MoMo',
                'ZALOPAY': 'ZaloPay',
                'VNPAY': 'VNPay',
                'CREDIT_CARD': 'Thẻ tín dụng'
            };

            return methods[code] || code;
        };

        // Get status display
        const getStatusDisplay = () => {
            switch (transaction.status) {
                case 'PAID':
                    return {
                        label: 'Thành công',
                        bgColor: 'bg-green-100',
                        textColor: 'text-green-800',
                        icon: <CheckCircle className="w-4 h-4 text-green-500" />
                    };
                case 'CANCELLED':
                    return {
                        label: 'Đã hủy',
                        bgColor: 'bg-red-100',
                        textColor: 'text-red-800',
                        icon: <XCircle className="w-4 h-4 text-red-500" />
                    };
                case 'NEW':
                    return {
                        label: 'Đang xử lý',
                        bgColor: 'bg-yellow-100',
                        textColor: 'text-yellow-800',
                        icon: <Clock className="w-4 h-4 text-yellow-500" />
                    };
                default:
                    return {
                        label: transaction.status,
                        bgColor: 'bg-gray-100',
                        textColor: 'text-gray-800',
                        icon: <FileText className="w-4 h-4 text-gray-500" />
                    };
            }
        };

        const status = getStatusDisplay();

        return (
            <div className="bg-white rounded-lg border hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="px-4 py-3">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-medium flex items-center gap-2">
                                <span className="flex items-center gap-1.5">
                                    {status.icon}
                                    Mã GD: {transaction.transaction_id}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${status.bgColor} ${status.textColor} hover:opacity-90 transition-opacity`}>
                                    {status.label}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(transaction.created_at)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(transaction.created_at)}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-bold text-lg ${
                                transaction.status === 'PAID' ? 'text-green-600' :
                                    transaction.status === 'NEW' ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                                {formatCurrency(transaction.amount)}
                            </div>
                            <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-1">
                                <CreditCard className="w-3 h-3" />
                                {getPaymentMethod(transaction.payment_method_code)}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                            {transaction.status === 'PAID' &&
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    Thanh toán thành công
                                </span>
                            }
                            {transaction.status === 'NEW' &&
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-yellow-500" />
                                    Đang chờ thanh toán
                                </span>
                            }
                            {transaction.status === 'CANCELLED' &&
                                <span className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-red-500" />
                                    Đã hủy giao dịch
                                </span>
                            }
                        </div>
                        <button
                            onClick={() => navigate(`/transactions/${transaction.checkout_draft_id}`)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50"
                        >
                            <span>Xem chi tiết</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const TransactionCardSkeleton = () => (
        <div className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="text-right">
                    <div className="h-5 bg-gray-200 rounded w-24 ml-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-28 ml-auto animate-pulse"></div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
        </div>
    );

    const TabButton = ({ id, label, count }: { id: string, label: string, count?: number }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center px-3 py-1.5 rounded-md font-medium text-sm transition-colors duration-200
                ${activeTab === id
                ? 'bg-blue-50 text-blue-700 border-blue-200 border shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 border-transparent border'}`}
        >
            {label}
            {count !== undefined && (
                <span
                    className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full 
                        ${activeTab === id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                >
                    {count}
                </span>
            )}
        </button>
    );

    // Empty state with filtered results
    const EmptyFilteredState = () => (
        <div className="text-center py-12 bg-white rounded-lg border">
            <div className="flex justify-center mb-4">
                <FileText className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
                Không có giao dịch nào
            </h3>
            <p className="text-gray-500 text-sm">
                Không tìm thấy giao dịch nào trong danh mục này
            </p>
        </div>
    );

    // Pagination component
    // Pagination component
    const Pagination = ({ totalPages }: { totalPages: number }) => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center mt-6 space-x-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md border text-sm transition-colors
                ${currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    Trước
                </button>

                {/* Hiển thị các nút số trang */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic hiển thị các trang xung quanh trang hiện tại
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

                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-md border text-sm transition-colors
                        ${currentPage === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-md border text-sm transition-colors
                ${currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    Tiếp
                </button>
            </div>
        );
    };

    // Hàm lọc, sắp xếp và phân trang
    const getFilteredSortedPaginatedTransactions = () => {
        // Lọc theo tab
        let filtered = transactions.filter(transaction => {
            if (activeTab === 'all') return true;
            return transaction.status === activeTab.toUpperCase();
        });

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(transaction =>
                transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sắp xếp
        filtered = filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'highest':
                    return b.amount - a.amount;
                case 'lowest':
                    return a.amount - b.amount;
                default:
                    return 0;
            }
        });

        // Tính toán tổng số trang
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Phân trang
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filtered.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            totalItems,
            totalPages
        };
    };

    // Dùng kết quả từ hàm để hiển thị
    const { items: paginatedTransactions, totalItems, totalPages } = getFilteredSortedPaginatedTransactions();

    // Count transactions by status
    // Count transactions by status
    const getStatusCount = (status: string) => {
        // Trước tiên, lọc theo từ khóa tìm kiếm
        let filtered = transactions;

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(transaction =>
                transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sau đó đếm theo trạng thái
        return filtered.filter(transaction =>
            status === 'all' ? true : transaction.status === status.toUpperCase()
        ).length;
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <ReceiptText className="w-5 h-5 text-blue-600"/>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Lịch sử giao dịch
                        </h1>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>{totalItems} giao dịch</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-md flex items-center gap-1.5 text-red-700 text-sm">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Tabs and controls container */}
                <div className="mb-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-3">
                        <div className="flex flex-wrap gap-2">
                            <TabButton id="all" label="Tất cả" count={getStatusCount('all')} />
                            <TabButton id="paid" label="Thành công" count={getStatusCount('paid')} />
                            <TabButton id="new" label="Đang xử lý" count={getStatusCount('new')} />
                            <TabButton id="cancelled" label="Đã hủy" count={getStatusCount('cancelled')} />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm mã giao dịch..."
                                    className="pl-9 pr-3 py-1.5 text-sm border rounded-md w-full sm:w-48 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                                {isSearching && (
                                    <span className="absolute right-2 top-1.5 text-xs text-gray-400">
                                        Đang tìm...
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Sắp xếp:</span>
                                <select
                                    className="border border-gray-300 rounded-md text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-400"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="highest">Giá cao nhất</option>
                                    <option value="lowest">Giá thấp nhất</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="border-b border-gray-200 mb-4"></div>
                </div>

                {/* Content */}
                <div key={`transaction-list-${activeTab}-${searchTerm}-${sortOrder}-${currentPage}`}>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <TransactionCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : paginatedTransactions.length === 0 ? (
                        activeTab === 'all' && searchTerm === '' ? (
                            <EmptyTransactions />
                        ) : (
                            <EmptyFilteredState />
                        )
                    ) : (
                        <>
                            <div className="space-y-3">
                                {paginatedTransactions.map((transaction) => (
                                    <TransactionCard
                                        key={transaction.id}
                                        transaction={transaction}
                                    />
                                ))}
                            </div>

                            {/* Hiển thị thông tin số lượng và phân trang */}
                            {totalItems > 0 && (
                                <div className="mt-4">
                                    <div className="text-xs text-gray-500 text-center">
                                        Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} giao dịch
                                    </div>
                                    <Pagination totalPages={totalPages} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}

export default TransactionHistoryPage;