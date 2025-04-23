import React, { useState, useEffect } from 'react';
import { patchAdminWithAuth, requestAdminWithAuth, requestWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import {
    Check,
    X,
    Loader2,
    Banknote,
    DollarSign,
    Search,
    RefreshCcw,
    FileCheck
} from 'lucide-react';
import { Withdrawal } from "../../types/withdraw";
import { useNotification } from "../../components/notification/NotificationProvider";
import { HiArrowTrendingUp } from "react-icons/hi2";

export default function AdminWithdraw() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWithdraw, setSelectedWithdraw] = useState<Withdrawal | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchPendingWithdrawals();
        setIsRefreshing(false);
    };

    const filteredWithdrawals = withdrawals.filter(w =>
        w.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.accountNumber?.includes(searchTerm) ||
        w.accountHolder?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchPendingWithdrawals();
    }, []);

    const fetchPendingWithdrawals = async () => {
        try {
            const response = await requestAdminWithAuth<{ withdraws: Withdrawal[] }>(
                `${ENDPOINTS.ADMIN.WITHDRAWS}`
            );
            setWithdrawals(response.withdraws);
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (withdrawId: number) => {
        setIsProcessing(true);
        try {
            const withdraw = withdrawals.find(w => w.id === withdrawId);
            await patchAdminWithAuth(
                `${ENDPOINTS.ADMIN.WITHDRAWS}/${withdrawId}`,
                {
                    status: 'COMPLETED',
                    instructor: {
                        id: withdraw?.instructor?.id,
                        name: withdraw?.instructor?.name,
                        email: withdraw?.instructor?.email
                    }
                }
            );
            setWithdrawals(prevWithdrawals =>
                prevWithdrawals.filter(w => w.id !== withdrawId)
            );
            showNotification('success', 'Thành công', 'Đã duyệt yêu cầu rút tiền');
        } catch (error) {
            showNotification('error', 'Thất bại', 'Có lỗi xảy ra khi duyệt yêu cầu');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) {
            showNotification('error', 'Lỗi', 'Vui lòng nhập lý do từ chối');
            return;
        }
        setIsProcessing(true);
        try {
            await patchAdminWithAuth(
                `${ENDPOINTS.ADMIN.WITHDRAWS}/${selectedWithdraw?.id}`,
                {
                    status: 'REJECTED',
                    rejectionReason,
                    instructor: {
                        id: selectedWithdraw?.instructor?.id,
                        name: selectedWithdraw?.instructor?.name,
                        email: selectedWithdraw?.instructor?.email
                    }
                }
            );
            setWithdrawals(prevWithdrawals =>
                prevWithdrawals.filter(w => w.id !== selectedWithdraw?.id)
            );
            setShowRejectModal(false);
            setRejectionReason('');
            showNotification('success', 'Thành công', 'Đã từ chối yêu cầu rút tiền');
        } catch (error) {
            showNotification('error', 'Thất bại', 'Có lỗi xảy ra khi từ chối yêu cầu');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Banknote className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu rút tiền chờ xử lý</h1>
                        <p className="text-gray-500">Quản lý và xử lý các yêu cầu rút tiền từ giảng viên</p>
                    </div>
                </div>
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    {/* Background decoration */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <FileCheck className="w-5 h-5 text-blue-600"/>
                            <p className="text-sm font-medium text-blue-600">
                                Yêu cầu chờ xử lý
                            </p>
                        </div>

                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-3xl font-bold text-gray-900 tabular-nums animate-in slide-in-from-left-4">
                                {withdrawals.length}
                            </span>
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"/>
                        </div>

                        {/* Thêm thông tin chi tiết */}
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                                <p className="text-gray-500">Yêu cầu cũ nhất</p>
                                <p className="font-medium text-gray-700">
                                    {withdrawals[0]?.createdAt ? new Date(withdrawals[0].createdAt).toLocaleString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Yêu cầu mới nhất</p>
                                <p className="font-medium text-gray-700">
                                    {withdrawals[withdrawals.length - 1]?.createdAt ? new Date(withdrawals[withdrawals.length - 1].createdAt).toLocaleString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div
                            className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-blue-50/50 to-transparent -z-10"/>
                    </div>
                </div>

                <div
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    {/* Background decoration */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

                    <div className="relative flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600"/>
                                <p className="text-gray-600 font-medium">Tổng số tiền chờ xử lý</p>
                            </div>
                            <div className="mt-4">
                                <div className="text-4xl font-bold text-gray-900 tabular-nums">
                                    {withdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString()}
                                    <span className="text-lg ml-1 font-medium text-gray-600">VND</span>
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                    <HiArrowTrendingUp className="w-4 h-4 text-emerald-500"/>
                                    <p className="text-sm text-gray-500">
                                        Trung bình: <span className="font-medium text-emerald-600">
                                {(withdrawals.reduce((sum, w) => sum + w.amount, 0) / (withdrawals.length || 1)).toLocaleString()} VND
                            </span>/yêu cầu
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <DollarSign className="w-8 h-8 text-emerald-600"/>
                        </div>
                    </div>

                    {/* Decorative dots */}
                    <div
                        className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-emerald-50 to-transparent rounded-tl-full transform translate-x-8 translate-y-8 opacity-50"/>
                </div>
            </div>
            {/* Search and Actions Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Tìm theo tên giảng viên, số tài khoản..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}/>
                    Làm mới
                </button>
            </div>

            {/* Enhanced Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thời gian
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giảng viên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thông tin ngân hàng
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredWithdrawals.map((withdraw: Withdrawal) => (
                            <tr key={withdraw.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(withdraw.createdAt).toLocaleString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">
                                            {withdraw.instructor?.name || 'N/A'}
                                        </div>
                                        <div className="text-gray-500">
                                            ID: {withdraw.instructor?.id}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {withdraw.amount.toLocaleString()} VND
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-900">{withdraw.bankName}</p>
                                        <p className="font-mono text-gray-600">{withdraw.accountNumber}</p>
                                        <p className="text-gray-600">{withdraw.accountHolder}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleApprove(withdraw.id)}
                                            disabled={isProcessing}
                                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Duyệt
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedWithdraw(withdraw);
                                                setShowRejectModal(true);
                                            }}
                                            disabled={isProcessing}
                                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Từ chối
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận từ chối yêu cầu</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lý do từ chối
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    rows={3}
                                    placeholder="Nhập lý do từ chối yêu cầu..."
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center disabled:opacity-50 transition-colors"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Xác nhận từ chối'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}