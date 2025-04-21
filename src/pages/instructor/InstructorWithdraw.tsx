import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { useInstructor } from '../../layouts/InstructorLayout';
import { getWithAuth, request, requestPostFormDataWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { useNotification } from '../../components/notification/NotificationProvider';
import { Bank } from '../../types/bank';
import { BankSelect } from '../../components/instructor/BankSelect';
import { ConfirmWithdrawModal } from '../../components/instructor/ConfirmWithdrawModal';

interface WithdrawFormData {
    amount: number;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
}

interface WithdrawalRequest {
    id: number;
    instructorId: number;
    amount: number;
    type: 'BANK';
    bankCode: string | null;
    bankName: string | null;
    accountNumber: string | null;
    accountHolder: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}

interface WithdrawResponse {
    withdraws: WithdrawalRequest[];
}

export const InstructorWithdraw: React.FC = () => {
    const { instructor, setInstructor } = useInstructor();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
    const [expandedRow, setExpandedRow] = useState<number | null>(null); // Track expanded row
    const formRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<WithdrawFormData>({
        amount: 2000,
        bankName: '',
        accountNumber: '',
        accountHolder: '',
    });

    const isFormDisabled = (instructor?.money || 0) < 2000;

    // Log withdrawalRequests when it updates
    useEffect(() => {
        console.log('Updated withdrawalRequests:', withdrawalRequests);
    }, [withdrawalRequests]);

    // Format currency with VND
    const formatCurrency = (value: number): string => {
        if (value === null || value === undefined || isNaN(value)) return '';
        return value.toLocaleString('vi-VN');
    };

    // Parse currency string to number
    const parseCurrency = (value: string): number => {
        return Number(value.replace(/[^0-9]/g, '')) || 0;
    };

    // Handle input changes with currency formatting
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            const numberValue = parseCurrency(value);
            if (numberValue > (instructor?.money || 0)) return;
            setFormData((prev) => ({
                ...prev,
                amount: numberValue,
            }));
        } else if (name === 'accountNumber') {
            const onlyNumbers = value.replace(/[^0-9]/g, '');
            setFormData((prev) => ({
                ...prev,
                [name]: onlyNumbers,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle bank selection
    const handleBankSelect = (bank: Bank) => {
        setSelectedBank(bank);
        setFormData((prev) => ({
            ...prev,
            bankName: bank.name,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate minimum amount
        if (formData.amount < 2000) {
            showNotification('error', 'Lỗi', 'Số tiền tối thiểu là 2.000 VND');
            return;
        }

        // Validate maximum amount
        if (formData.amount > (instructor?.money || 0)) {
            showNotification('error', 'Lỗi', 'Số tiền vượt quá số dư khả dụng');
            return;
        }

        formRef.current?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            setShowConfirmModal(true);
        }, 500);
    };

    // Handle confirm withdrawal
    const handleConfirmWithdraw = async () => {
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('amount', formData.amount.toString());
            if (!selectedBank) {
                throw new Error('Vui lòng chọn ngân hàng');
            }
            formDataToSend.append('bankCode', selectedBank.code);
            formDataToSend.append('bankName', selectedBank.shortName);
            formDataToSend.append('accountNumber', formData.accountNumber || '');
            formDataToSend.append('accountHolder', formData.accountHolder || '');

            await requestPostFormDataWithAuth(ENDPOINTS.INSTRUCTOR.WITHDRAW_BANK, formDataToSend);

            showNotification('success', 'Thành công', 'Yêu cầu rút tiền của bạn đã được xử lý');
            setShowConfirmModal(false);

            if (instructor) {
                const updatedInstructor = {
                    ...instructor,
                    money: instructor.money - formData.amount,
                };
                setInstructor(updatedInstructor);
            }

            // Refresh withdrawal requests
            await fetchWithdrawalRequests();

            // Reset form
            setSelectedBank(null);
            setFormData({
                amount: 2000,
                bankName: '',
                accountNumber: '',
                accountHolder: '',
            });
        } catch (error) {
            showNotification(
                'error',
                'Thất bại',
                error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý yêu cầu rút tiền'
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch banks data
    const fetchBanks = async () => {
        try {
            const response: Bank[] = await request(ENDPOINTS.BANK.BASIC);
            setBanks(response);
        } catch (error) {
            console.error('Error fetching banks:', error);
        }
    };

    // Fetch withdrawal requests
    const fetchWithdrawalRequests = async () => {
        try {
            const response = await getWithAuth<WithdrawResponse>(ENDPOINTS.INSTRUCTOR.WITHDRAW_GET_ALL);
            console.log('Withdraws response:', response);
            const withdraws = response?.withdraws || [];
            if (Array.isArray(withdraws)) {
                setWithdrawalRequests(withdraws);
                console.log('Set withdrawalRequests:', withdraws);
            } else {
                console.error('Withdraws is not an array:', withdraws);
                setWithdrawalRequests([]);
                showNotification('error', 'Lỗi', 'Dữ liệu yêu cầu rút tiền không hợp lệ');
            }
        } catch (error) {
            console.error('Error fetching withdrawal requests:', error);
            setWithdrawalRequests([]);
            showNotification('error', 'Lỗi', 'Không thể tải danh sách yêu cầu rút tiền');
        }
    };

    useEffect(() => {
        fetchBanks();
        fetchWithdrawalRequests();
    }, []);

    // Toggle expanded row
    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    // Get status badge class and text
    const getStatusBadge = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
        const classes = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
        };

        const labels = {
            PENDING: 'Đang xử lý',
            APPROVED: 'Đã duyệt',
            REJECTED: 'Bị từ chối',
        };

        return {
            className: `inline-block px-2 py-1 rounded-full text-xs font-medium ${classes[status]}`,
            label: labels[status],
        };
    };

    // Format date string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Rút tiền</h1>
            </div>

            {/* Balance Display */}
            <div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg p-3 bg-blue-500">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-600">Số dư khả dụng</h3>
                            <p className="text-2xl font-bold text-slate-900 mt-1">
                                {formatCurrency(instructor?.money || 0)} VND
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-200">
                <nav className="flex space-x-4" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('withdraw')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'withdraw'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Rút tiền
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'history'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Lịch sử
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                {activeTab === 'withdraw' && (
                    <div ref={formRef}>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            Rút về tài khoản ngân hàng
                        </h2>
                        {isFormDisabled && (
                            <p className="text-red-600 font-medium mb-4">
                                Số tiền để yêu cầu rút tối thiểu là 2000
                            </p>
                        )}
                        <form
                            onSubmit={handleSubmit}
                            className={`space-y-6 ${isFormDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="space-y-4">
                                {/* Row 1: Amount + Bank */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Số tiền
                                        </label>
                                        <input
                                            type="text"
                                            name="amount"
                                            value={formData.amount ? `${formatCurrency(formData.amount)}` : ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-slate-100"
                                            required
                                            placeholder="Nhập số tiền cần rút"
                                            disabled={isFormDisabled}
                                        />
                                        <p className="text-sm text-slate-500 mt-1">
                                            Tối thiểu: 2.000 VND - Tối đa: {formatCurrency(instructor?.money || 0)} VND
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Chọn ngân hàng
                                        </label>
                                        <BankSelect
                                            selectedBank={selectedBank}
                                            onBankSelect={handleBankSelect}
                                            banks={banks}
                                            required
                                            className="w-full"
                                            disabled={isFormDisabled}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Account Number + Account Holder */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-700">
                                                Số tài khoản
                                            </label>
                                            <span className="text-sm text-red-500">*Kiểm tra kỹ</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="accountNumber"
                                            value={formData.accountNumber}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-slate-100"
                                            required
                                            placeholder="Nhập số tài khoản"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            disabled={isFormDisabled}
                                        />
                                        <p className="mt-1 text-sm text-slate-500">
                                            Yêu cầu có thể bị từ chối nếu số tài khoản sai
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-700">
                                                Tên chủ tài khoản
                                            </label>
                                            <span className="text-sm text-red-500">*Kiểm tra kỹ</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="accountHolder"
                                            value={formData.accountHolder}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-slate-100"
                                            required
                                            placeholder="Nhập tên chủ tài khoản"
                                            disabled={isFormDisabled}
                                        />
                                        <p className="mt-1 text-sm text-slate-500">
                                            Yêu cầu có thể bị từ chối nếu tên không khớp
                                        </p>
                                    </div>
                                </div>

                                {/* Warning Message and Form Actions (only if not disabled) */}
                                {!isFormDisabled && (
                                    <>
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <p className="text-blue-700 font-medium mb-2">Lưu ý quan trọng:</p>
                                            <ul className="text-sm text-blue-600 space-y-1">
                                                <li>• Số tiền sẽ được giữ lại ngay khi bạn gửi yêu cầu rút tiền</li>
                                                <li>• Nếu yêu cầu không được duyệt, số tiền sẽ được hoàn trả</li>
                                            </ul>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedBank(null);
                                                    setFormData({
                                                        amount: 2000,
                                                        bankName: '',
                                                        accountNumber: '',
                                                        accountHolder: '',
                                                    });
                                                }}
                                                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                disabled={loading}
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                                disabled={
                                                    loading ||
                                                    !formData.amount ||
                                                    !selectedBank ||
                                                    !formData.accountNumber ||
                                                    !formData.accountHolder
                                                }
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        <span>Đang xử lý...</span>
                                                    </div>
                                                ) : (
                                                    'Xác nhận'
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Lịch sử yêu cầu rút tiền</h2>
                        {withdrawalRequests.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">Chưa có yêu cầu rút tiền nào</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-0">
                                    <thead className="bg-slate-50">
                                    <tr>
                                        <th className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                                            Mã yêu cầu
                                        </th>
                                        <th className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                                            Ngày tạo
                                        </th>
                                        <th className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                                            Số tiền
                                        </th>
                                        <th className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                                            Ngân hàng
                                        </th>
                                        <th className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                                            Số tài khoản
                                        </th>
                                        <th className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                                            Trạng thái
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {withdrawalRequests.map((request, index) => {
                                        const statusBadge = getStatusBadge(request.status);
                                        const isRejected = request.status === 'REJECTED';
                                        const isExpanded = expandedRow === request.id;

                                        return (
                                            <React.Fragment key={request.id}>
                                                <tr className={`hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200">
                                                        {request.id}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200">
                                                        {formatDate(request.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200">
                                                        {formatCurrency(request.amount)} VND
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200">
                                                        {request.bankName || "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200">
                                                        {request.accountNumber || "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700 border-b border-slate-200">
                                                        <div className="flex items-center gap-2">
                                                                <span className={statusBadge.className}>
                                                                    {statusBadge.label}
                                                                </span>
                                                            {isRejected && (
                                                                <button
                                                                    onClick={() => toggleRow(request.id)}
                                                                    className="text-slate-400 hover:text-slate-600"
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="w-4 h-4" />
                                                                    ) : (
                                                                        <ChevronDown className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isRejected && isExpanded && (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-3 bg-red-50 text-sm text-slate-700 border-b border-slate-200">
                                                            <div className="p-2">
                                                                <p className="font-medium text-red-700">Lý do từ chối:</p>
                                                                <p className="text-red-600">{request.rejectionReason || "Không có lý do cụ thể"}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            <ConfirmWithdrawModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmWithdraw}
                loading={loading}
                withdrawType="bank"
                formData={formData}
                selectedBank={selectedBank}
            />
        </div>
    );
};