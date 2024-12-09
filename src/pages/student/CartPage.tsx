import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { ShoppingCart, Trash2, CreditCard, Users, Star, AlertCircle } from 'lucide-react';
import {createCheckout, getCart, removeFromCart} from "../../services/cartService";
import {formatCurrency} from "../../utils/formatCurrency";

interface CartItem {
    id: number;
    courseId: number;
    originalPrice: number;
    title: string;
    shortDescription: string;
    imageUrl: string;
    discountPrice: number | null;
    averageRating: number;
    totalStudents: number;
    isDiscount: boolean;
}

interface Cart {
    id: number;
    totalPrice: number;
    items: CartItem[];
}




export function CartPage() {


    // cac component => se tach ra sau
    const EmptyCart = ({ onExplore }: { onExplore: () => void }) => (
        <div className="text-center py-16">
            <div className="flex justify-center mb-6">
                <ShoppingCart className="w-24 h-24 text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-500 mb-6">Hãy khám phá các khóa học hấp dẫn của chúng tôi</p>
            <button
                onClick={onExplore}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full
                     font-medium shadow-lg hover:shadow-blue-500/30 transition-all duration-300
                     hover:-translate-y-0.5 active:translate-y-0"
            >
                Khám phá ngay
            </button>
        </div>
    );
    const CourseCard = ({ item, onRemove }: { item: CartItem; onRemove: (id: number) => void }) => (
        <div className="group bg-white rounded-lg border hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative w-32 h-20 flex-shrink-0 rounded-md overflow-hidden">
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.isDiscount && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        Giảm giá
                    </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
                        {item.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {item.shortDescription}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.totalStudents.toLocaleString()}
                    </span>
                        <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            {item.averageRating}
                    </span>
                    </div>
                </div>

                {/* Price and Remove */}
                <div className="flex flex-col items-end justify-between ml-4">
                    <div className="text-right">
                        {item.isDiscount && item.originalPrice > 0 && (
                            <div className="text-xs line-through text-gray-400">
                                {formatCurrency(item.originalPrice)}
                            </div>
                        )}
                        <div className={`text-sm font-semibold ${
                            item.originalPrice <= 0 || (item.discountPrice && item.discountPrice <= 0)
                                ? 'text-green-600'
                                : 'text-blue-600'
                        }`}>
                            {formatCurrency(item.discountPrice || item.originalPrice)}
                        </div>
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
    const OrderSummary = ({ cart, onCheckout }: { cart: Cart; onCheckout: () => void }) => {
        // Tính toán các giá trị tổng
        const totalOriginalPrice = cart.items.reduce((sum, item) => sum + item.originalPrice, 0);
        const totalDiscountPrice = cart.totalPrice;
        const totalSaved = totalOriginalPrice - totalDiscountPrice;
        const hasDiscount = totalSaved > 0;

        return (
            <div className="bg-white rounded-lg border p-4 mt-8 lg:mt-0">
                <h2 className="text-sm font-medium text-gray-900 mb-4">Chi tiết đơn hàng</h2>

                <div className="space-y-3 text-sm">
                    {/* Số lượng khóa học */}
                    <div className="flex justify-between text-gray-600">
                        <span>Số lượng khóa học</span>
                        <span className="font-medium">{cart.items.length}</span>
                    </div>

                    {/* Giá gốc - chỉ hiển thị nếu có giảm giá */}
                    {hasDiscount && (
                        <div className="flex justify-between text-gray-600">
                            <span>Giá gốc</span>
                            <span className="line-through">
                            {formatCurrency(totalOriginalPrice)}
                        </span>
                        </div>
                    )}

                    {/* Số tiền giảm - chỉ hiển thị nếu có giảm giá */}
                    {hasDiscount && (
                        <div className="flex justify-between text-green-600">
                            <span>Tiết kiệm</span>
                            <span className="font-medium">
                            - {formatCurrency(totalSaved)}
                        </span>
                        </div>
                    )}

                    {/* Tổng tiền cuối cùng */}
                    <div className="pt-3 border-t mt-2">
                        <div className="flex justify-between items-baseline">
                            <span className="font-medium text-gray-900">Tổng tiền</span>
                            <div className="text-right">
                            <span className="text-lg font-bold text-blue-600">
                                {formatCurrency(totalDiscountPrice)}
                            </span>
                                {hasDiscount && (
                                    <div className="text-xs text-green-600 mt-0.5">
                                        (Đã giảm {((totalSaved / totalOriginalPrice) * 100).toFixed(0)}%)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nút thanh toán */}
                    <button
                        onClick={onCheckout}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700
                             text-white text-sm font-medium rounded-lg
                             shadow-sm hover:shadow-blue-500/25
                             transition-all duration-300
                             flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        {totalDiscountPrice <= 0 ? 'Đăng ký ngay' : 'Thanh toán ngay'}
                    </button>

                    {/* Thông tin bổ sung */}
                    {hasDiscount && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-start gap-2 text-green-700 text-xs">
                                <div className="mt-0.5">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p>
                                    Bạn đã tiết kiệm được {formatCurrency(totalSaved)} với các khuyến mãi hiện có
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    const CourseCardSkeleton = () => (
        <div className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="flex gap-4">
                {/* Thumbnail skeleton */}
                <div className="relative w-32 h-20 flex-shrink-0 rounded-md bg-gray-200" />

                {/* Content skeleton */}
                <div className="flex-1 min-w-0 space-y-3">
                    {/* Title skeleton */}
                    <div className="h-4 bg-gray-200 rounded w-3/4" />

                    {/* Description skeleton */}
                    <div className="h-3 bg-gray-200 rounded w-full" />

                    {/* Stats skeleton */}
                    <div className="flex items-center gap-3">
                        <div className="h-3 bg-gray-200 rounded w-16" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                </div>

                {/* Price skeleton */}
                <div className="flex flex-col items-end justify-between ml-4">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-6 w-6 bg-gray-200 rounded-full" />
                </div>
            </div>
        </div>
    );
    const OrderSummarySkeleton = () => (
        <div className="bg-white rounded-lg border p-4 animate-pulse">
            {/* Title skeleton */}
            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />

            <div className="space-y-3">
                {/* Items count skeleton */}
                <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-8" />
                </div>

                {/* Price skeletons */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-20" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-16" />
                        <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                </div>

                {/* Total price skeleton */}
                <div className="pt-3 border-t mt-2">
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                        <div className="h-5 bg-gray-200 rounded w-28" />
                    </div>
                </div>

                {/* Button skeleton */}
                <div className="h-10 bg-gray-200 rounded-lg mt-4" />
            </div>
        </div>
    );

    // state
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRemoving, setIsRemoving] = useState(false);
    const navigate = useNavigate();

    // function
    const handleCheckout = async () => {
        try {
            if (!cart) return;
            setLoading(true);

            const response = await createCheckout(cart.id);
            console.log("handleCheckout", response)
            if (response.code === 1 && response.data.checkout_draft) {
                localStorage.setItem('checkoutDraft', JSON.stringify(response.data.checkout_draft));
                console.log("handleCheckout", response.data.checkout_draft);
                navigate('/checkout', {
                    state: { checkoutDraftId: response.data.checkout_draft.id }
                });
            } else {
                setError(response.error_message || 'Có lỗi xảy ra khi tạo đơn hàng');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        try {
            const cartData = await getCart();
            setCart(cartData);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemoveItem = async (itemId: number) => {
        try {
            setIsRemoving(true);
            await removeFromCart(itemId);
            await fetchCart();

            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (err) {
            setError("Đã có lỗi xảy ra khi xóa khóa học");
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header luôn hiển thị */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-blue-600"/>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Giỏ hàng của bạn {!loading && `(${cart?.items.length || 0})`}
                        </h1>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-md flex items-center gap-1.5 text-red-700 text-xs">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <CourseCardSkeleton key={i} />
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-4">
                                <OrderSummarySkeleton />
                            </div>
                        </div>
                    </div>
                ) : (!cart?.items || cart.items.length === 0) ? (
                    <EmptyCart onExplore={() => navigate('/')} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-3">
                            {cart?.items.map((item) => (
                                <div key={item.id} className={`transition-opacity duration-300 ${isRemoving ? 'opacity-50' : 'opacity-100'}`}>
                                    <CourseCard
                                        item={item}
                                        onRemove={handleRemoveItem}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-4">
                                <OrderSummary
                                    cart={cart}
                                    onCheckout={handleCheckout}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SearchHeaderAndFooterLayout>
    );
}
export default CartPage;