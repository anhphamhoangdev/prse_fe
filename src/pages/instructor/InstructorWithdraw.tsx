import React, {useContext, useState, useEffect, useRef} from 'react';
import { DollarSign, CreditCard, User, ArrowRight } from "lucide-react";
import { InstructorContext } from "../../layouts/InstructorLayout";
import {request, requestPostFormDataWithAuth, requestWithAuth} from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import { useNotification } from "../../components/notification/NotificationProvider";
import {Bank} from "../../types/bank";
import {BankSelect} from "../../components/instructor/BankSelect";
import {ConfirmWithdrawModal} from "../../components/instructor/ConfirmWithdrawModal";

interface WithdrawFormData {
    amount: number;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
}

// Temporary mock data
const mockBanks: Bank[] = [
    {
        name: "Ngân hàng TMCP Á Châu",
        code: "ACB",
        shortName: "ACB",
        logo: "https://api.vietqr.io/img/ACB.png"
    },
    {
        name: "Ngân hàng TMCP An Bình",
        code: "ABB",
        shortName: "ABBANK",
        logo: "https://api.vietqr.io/img/ABB.png"
    }
];

export const InstructorWithdraw: React.FC = () => {
    const { instructor } = useContext(InstructorContext);
    const { showNotification } = useNotification();
    const [withdrawType, setWithdrawType] = useState<'bank' | 'student' | null>(null);
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<WithdrawFormData>({
        amount: 2000,
        bankName: '',
        accountNumber: '',
        accountHolder: '',
    });

    // Format currency with VND
    const formatCurrency = (value: number): string => {
        if (!value) return '';
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
            setFormData(prev => ({
                ...prev,
                amount: numberValue
            }));
        } else if (name === 'accountNumber') {
            // Chỉ cho phép nhập số
            const onlyNumbers = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: onlyNumbers
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle bank selection
    const handleBankSelect = (bank: Bank) => {
        setSelectedBank(bank);
        setFormData(prev => ({
            ...prev,
            bankName: bank.name
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate minimum amount
        if (formData.amount < 2000) {
            showNotification(
                'error',
                'Lỗi',
                'Số tiền tối thiểu là 2.000 VND'
            );
            return;
        }

        // Validate maximum amount
        if (formData.amount > (instructor?.money || 0)) {
            showNotification(
                'error',
                'Lỗi',
                'Số tiền vượt quá số dư khả dụng'
            );
            return;
        }

        if(withdrawType === 'bank') {
            formRef.current?.scrollIntoView({behavior: 'smooth'});
        }

        // Delay một chút để scroll xong rồi mới show modal
        setTimeout(() => {
            setShowConfirmModal(true);
        }, 500); // 500ms để scroll mượt xong
    };

    const handleConfirmWithdraw = async () => {
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('amount', formData.amount.toString());

            if (withdrawType === 'bank') {
                if (!selectedBank) {
                    throw new Error('Vui lòng chọn ngân hàng');
                }
                formDataToSend.append('bankCode', selectedBank.code);
                formDataToSend.append('bankName', selectedBank.name);
                formDataToSend.append('accountNumber', formData.accountNumber || '');
                formDataToSend.append('accountHolder', formData.accountHolder || '');

                await requestPostFormDataWithAuth(
                    ENDPOINTS.INSTRUCTOR.WITHDRAW_BANK,
                    formDataToSend
                );
            } else {
                await requestPostFormDataWithAuth(
                    ENDPOINTS.INSTRUCTOR.WITHDRAW_STUDENT_ACCOUNT,
                    formDataToSend
                );
            }

            showNotification('success', 'Thành công', 'Yêu cầu rút tiền của bạn đã được xử lý');
            setShowConfirmModal(false);

            // Reset form
            setWithdrawType(null);
            setSelectedBank(null);
            setFormData({
                amount: 2000,
                bankName: '',
                accountNumber: '',
                accountHolder: ''
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
    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response: Bank[] = await request(ENDPOINTS.BANK.BASIC);
                setBanks(response);
            } catch (error) {
                console.error('Error fetching banks:', error);
            }
        };
        fetchBanks();

    }, []);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Rút tiền
                </h1>
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

            {/* Withdraw Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => setWithdrawType('bank')}
                    className={`bg-white p-6 rounded-xl transition-all duration-300 ${
                        withdrawType === 'bank'
                            ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]'
                            : 'shadow-sm hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`rounded-lg p-3 transition-colors duration-300 ${
                            withdrawType === 'bank' ? 'bg-blue-600' : 'bg-blue-500'
                        }`}>
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-medium text-slate-900">Rút về tài khoản ngân hàng</h3>
                            <p className="text-slate-500 text-sm mt-1">
                                Rút tiền về tài khoản ngân hàng của bạn
                            </p>
                        </div>
                        <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                            withdrawType === 'bank'
                                ? 'text-blue-600 translate-x-1'
                                : 'text-slate-400'
                        }`} />
                    </div>
                </button>

                <button
                    onClick={() => setWithdrawType('student')}
                    className={`bg-white p-6 rounded-xl transition-all duration-300 ${
                        withdrawType === 'student'
                            ? 'ring-2 ring-violet-500 shadow-lg scale-[1.02]'
                            : 'shadow-sm hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`rounded-lg p-3 transition-colors duration-300 ${
                            withdrawType === 'student' ? 'bg-violet-600' : 'bg-violet-500'
                        }`}>
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-medium text-slate-900">
                                Chuyển vào tài khoản học viên
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">
                                Chuyển tiền vào tài khoản học viên để mua khóa học
                            </p>
                        </div>
                        <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                            withdrawType === 'student'
                                ? 'text-violet-600 translate-x-1'
                                : 'text-slate-400'
                        }`} />
                    </div>
                </button>
            </div>

            {/* Withdraw Form */}
            <div className={`transition-all duration-500 ease-in-out transform ${
                withdrawType
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none h-0'
            }`}>
                {withdrawType && (
                    <div ref={formRef} className="bg-white rounded-xl shadow-sm p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                    {withdrawType === 'bank'
                                        ? 'Rút về tài khoản ngân hàng'
                                        : 'Chuyển vào tài khoản học viên'
                                    }
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {/* Amount Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Số tiền
                                    </label>
                                    <input
                                        type="text"
                                        name="amount"
                                        value={formData.amount ? `${formatCurrency(formData.amount)}` : ''}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        required
                                        placeholder="Nhập số tiền cần rút"
                                    />
                                    <p className="text-sm text-slate-500 mt-1">
                                        Tối thiểu: 2.000 VND - Tối đa: {formatCurrency(instructor?.money || 0)} VND
                                    </p>
                                </div>

                                {/* Bank Form Fields */}
                                {withdrawType === 'bank' && (
                                    <>
                                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-blue-700 font-medium mb-2">Lưu ý quan trọng:</p>
                                            <ul className="text-sm text-blue-600 space-y-1">
                                                <li>• Số tiền sẽ được giữ lại ngay khi bạn gửi yêu cầu rút tiền</li>
                                                <li>• Trong trường hợp yêu cầu không được duyệt, số tiền sẽ được hoàn trả về tài khoản của bạn</li>
                                            </ul>
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
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-slate-700">
                                                    Số tài khoản
                                                </label>
                                                <span className="text-sm text-red-500">*Vui lòng kiểm tra kỹ thông tin</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                value={formData.accountNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                required
                                                placeholder="Nhập số tài khoản"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                            />
                                            <p className="mt-1 text-sm text-slate-500">
                                                Yêu cầu rút tiền có thể bị từ chối nếu số tài khoản không chính xác
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-slate-700">
                                                    Tên chủ tài khoản
                                                </label>
                                                <span className="text-sm text-red-500">*Vui lòng kiểm tra kỹ thông tin</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="accountHolder"
                                                value={formData.accountHolder}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                required
                                                placeholder="Nhập tên chủ tài khoản"
                                            />
                                            <p className="mt-1 text-sm text-slate-500">
                                                Yêu cầu rút tiền có thể bị từ chối nếu tên chủ tài khoản không khớp
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {withdrawType === 'student' && (
                                <div className="mb-6 p-4 bg-amber-50/60 rounded-lg border border-amber-200">
                                    <p className="text-amber-800 font-semibold mb-2">Lưu ý quan trọng:</p>
                                    <ul className="text-sm text-amber-700 space-y-1.5">
                                        <li>• Sau khi chuyển vào tài khoản học viên, bạn <span className="font-bold text-amber-900">không thể rút số tiền này</span> về tài khoản ngân hàng</li>
                                        <li>• Số tiền này <span className="font-bold text-amber-900">chỉ có thể được sử dụng để mua khóa học</span> trên nền tảng</li>
                                    </ul>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWithdrawType(null);
                                        setSelectedBank(null);
                                        setFormData({
                                            amount: 0,
                                            bankName: '',
                                            accountNumber: '',
                                            accountHolder: ''
                                        });
                                    }}
                                    className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        withdrawType === 'bank'
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                                    } disabled:opacity-50`}
                                    disabled={loading || !formData.amount || (withdrawType === 'bank' && (!selectedBank || !formData.accountNumber || !formData.accountHolder))}
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
                        </form>
                    </div>
                )}
                <ConfirmWithdrawModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmWithdraw}
                    loading={loading}
                    withdrawType={withdrawType!}
                    formData={formData}
                    selectedBank={selectedBank}
                />
            </div>
        </div>
    );
};