export const formatCurrency = (amount: number | undefined): string => {
    if(amount === undefined) return "Free";
    if (amount <= 0) return "Miễn phí"; // Handle free courses
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
};