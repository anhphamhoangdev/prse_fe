import React, {useEffect, useState} from "react";
import {CheckoutDraft, CheckoutItem} from "../../types/checkout";
import {useLocation, useNavigate} from "react-router-dom";
import {SearchHeaderAndFooterLayout} from "../../layouts/UserLayout";
import {AlertCircle, CreditCard} from "lucide-react";
import {CheckoutSkeleton} from "../../components/payment/checkout/CheckoutSkeleton";
import {PaymentMethods} from "../../components/payment/checkout/PaymentMethods";
import {CheckoutCourseCard} from "../../components/payment/checkout/CheckoutCourseCard";
import {OrderSummary} from "../../components/payment/checkout/OrderSummary";
import {getPaymentMethods} from "../../services/paymentService";
import {PaymentMethod} from "../../types/payment";





export function CheckoutPage() {
    const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();


    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loadingMethods, setLoadingMethods] = useState(true);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);


    useEffect(() => {
        const initCheckout = () => {
            try {
                // Lấy draft từ localStorage
                const savedDraft = localStorage.getItem('checkoutDraft');
                if (!savedDraft) {
                    navigate('/cart');
                    return;
                }

                const draft = JSON.parse(savedDraft) as CheckoutDraft;

                // Verify draft id với state từ navigation
                const draftId = location.state?.checkoutDraftId;
                if (!draftId || draft.id !== draftId) {
                    navigate('/cart');
                    return;
                }

                setCheckoutDraft(draft);
            } catch (error) {
                setError("Có lỗi xảy ra khi tải thông tin đơn hàng");
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };

        initCheckout();

        // Cleanup khi unmount
        return () => {
            localStorage.removeItem('checkoutDraft');
        };
    }, [navigate, location]);

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

    // Prevent showing old data while loading
    if (loading) {
        return <CheckoutSkeleton />;
    }

    if (!checkoutDraft) {
        return null;
    }

    return (
        <SearchHeaderAndFooterLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-2 mb-8">
                    <CreditCard className="w-5 h-5 text-blue-600"/>
                    <h1 className="text-xl font-semibold text-gray-900">Thanh toán</h1>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Methods First */}
                        <PaymentMethods
                            selectedId={selectedPaymentMethod}
                            onSelect={setSelectedPaymentMethod}
                            methods={paymentMethods}
                            isLoading={loadingMethods}
                        />

                        {/* Course List with max height and scrolling */}
                        <div className="bg-white rounded-lg border">
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-semibold">
                                    Khóa học của bạn ({checkoutDraft.items.length})
                                </h2>
                            </div>
                            <div className="p-6" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <div className="space-y-4 pr-2">
                                    {checkoutDraft.items.map(item => (
                                        <CheckoutCourseCard key={item.id} item={item}/>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <OrderSummary
                                checkoutDraft={checkoutDraft}
                                onProceed={() => {
                                    if (!selectedPaymentMethod) {
                                        setError("Vui lòng chọn phương thức thanh toán");
                                        return;
                                    }
                                    // Handle payment
                                }}
                                selectedPaymentMethod={selectedPaymentMethod}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}