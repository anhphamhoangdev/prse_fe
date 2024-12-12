import React, {useEffect, useState} from 'react';
import {TrendingUp, Users, BookOpen, DollarSign, AlertCircle, Award, TrendingDown, CheckCircle} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Area
} from 'recharts';
import {requestAdminWithAuth, requestWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";
import CourseDistribution from "../../components/admin/CourseDistribution";


const courseDistributionData = [
    { name: 'Công nghệ thông tin', value: 35 },
    { name: 'Kinh doanh', value: 25 },
    { name: 'Ngoại ngữ', value: 20 },
    { name: 'Marketing', value: 15 },
    { name: 'Khác', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];


interface OverviewResponse {
    totalUsers: number;
    totalCourses: number;
    totalInstructors: number;
    totalRevenue: number;
    userGrowthRate: number;
    courseGrowthRate: number;
    instructorGrowthRate: number;
    revenueGrowthRate: number;
}

interface RevenueStatistic {
    month: string;
    revenue: number;
}

interface RevenueData {
    revenue_statistics: RevenueStatistic[];
}

interface CategoryDistribution{
    name: string;
    value: number;
}

interface CategoryDistributionData{
    category_distribution: CategoryDistribution[];
}

export const AdminDashboard = () => {

    const [overviewData, setOverviewData] = useState<OverviewResponse>({
        totalUsers: 0,
        totalCourses: 0,
        totalInstructors: 0,
        totalRevenue: 0,
        userGrowthRate: 0,
        courseGrowthRate: 0,
        instructorGrowthRate: 0,
        revenueGrowthRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [monthsCount, setMonthsCount] = useState(6);
    const [revenueData, setRevenueData] = useState<RevenueStatistic[]>([]);
    const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);


    function formatCurrency(amount: number): string {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M VND`;
        }
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K VND`;
        }
        return `${amount} VND`;
    }

    useEffect(() => {
        const loadOverview = async () => {
            try {
                setLoading(true);
                const response  = await requestAdminWithAuth<OverviewResponse>(ENDPOINTS.ADMIN.OVERVIEW);
                setOverviewData(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading overview data');
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, []);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await requestAdminWithAuth<RevenueData>(
                    `${ENDPOINTS.ADMIN.REVENUE}?monthsCount=${monthsCount}`
                );
                setRevenueData(response.revenue_statistics);
            } catch (error) {
                console.error('Error fetching revenue data:', error);
            }
        };

        fetchRevenueData();
    }, [monthsCount]);


    useEffect(() => {
        const fetchCategoryDistributionData = async () => {
            try {
                const response = await requestAdminWithAuth<CategoryDistributionData>(
                    `${ENDPOINTS.ADMIN.CATEGORY_DISTRIBUTION}`
                );
                setCategoryDistribution(response.category_distribution);
            } catch (error) {
                console.error('Error fetching category distribution data:', error);
            }
        };

        fetchCategoryDistributionData();
    }, [monthsCount]);

    return (
        <div className="p-6 space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                            <p className="text-2xl font-bold text-gray-900">{overviewData.totalUsers}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600"/>
                        </div>
                    </div>
                    <div className={`mt-4 flex items-center text-sm ${
                        overviewData.userGrowthRate > 0
                            ? 'text-green-600'
                            : overviewData.userGrowthRate < 0
                                ? 'text-red-600'
                                : 'text-blue-600'  
                    }`}>
                        {overviewData.userGrowthRate === 0 ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-1"/>
                                <span>Ổn định so với tháng trước</span>
                            </>
                        ) : (
                            <>
                                {overviewData.userGrowthRate > 0 ? (
                                    <TrendingUp className="w-4 h-4 mr-1"/>
                                ) : (
                                    <TrendingDown className="w-4 h-4 mr-1"/>
                                )}
                                <span>
                                    {overviewData.userGrowthRate > 0 ? '+' : ''}
                                                        {overviewData.userGrowthRate.toFixed(1)}% so với tháng trước
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Total Courses */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Số khóa học</p>
                            <p className="text-2xl font-bold text-gray-900">{overviewData.totalCourses}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600"/>
                        </div>
                    </div>
                    <div className={`mt-4 flex items-center text-sm ${
                        overviewData.courseGrowthRate > 0
                            ? 'text-green-600'
                            : overviewData.courseGrowthRate < 0
                                ? 'text-red-600'
                                : 'text-blue-600'
                    }`}>
                        {overviewData.courseGrowthRate === 0 ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-1"/>
                                <span>Ổn định so với tháng trước</span>
                            </>
                        ) : (
                            <>
                                {overviewData.courseGrowthRate > 0 ? (
                                    <TrendingUp className="w-4 h-4 mr-1"/>
                                ) : (
                                    <TrendingDown className="w-4 h-4 mr-1"/>
                                )}
                                <span>
                                    {overviewData.courseGrowthRate > 0 ? '+' : ''}
                                    {overviewData.courseGrowthRate.toFixed(1)}% so với tháng trước
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(overviewData.totalRevenue)}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600"/>
                        </div>
                    </div>
                    <div className={`mt-4 flex items-center text-sm ${
                        overviewData.revenueGrowthRate > 0
                            ? 'text-green-600'
                            : overviewData.revenueGrowthRate < 0
                                ? 'text-red-600'
                                : 'text-blue-600'
                    }`}>
                        {overviewData.revenueGrowthRate === 0 ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-1"/>
                                <span>Ổn định so với tháng trước</span>
                            </>
                        ) : (
                            <>
                                {overviewData.revenueGrowthRate > 0 ? (
                                    <TrendingUp className="w-4 h-4 mr-1"/>
                                ) : (
                                    <TrendingDown className="w-4 h-4 mr-1"/>
                                )}
                                <span>
                                    {overviewData.revenueGrowthRate > 0 ? '+' : ''}
                                    {overviewData.revenueGrowthRate.toFixed(1)}% so với tháng trước
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Active Instructors */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Giảng viên</p>
                            <p className="text-2xl font-bold text-gray-900">{overviewData.totalInstructors}</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <Award className="w-6 h-6 text-orange-600"/>
                        </div>
                    </div>
                    <div className={`mt-4 flex items-center text-sm ${
                        overviewData.instructorGrowthRate > 0
                            ? 'text-green-600'
                            : overviewData.instructorGrowthRate < 0
                                ? 'text-red-600'
                                : 'text-blue-600'
                    }`}>
                        {overviewData.instructorGrowthRate === 0 ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-1"/>
                                <span>Ổn định so với tháng trước</span>
                            </>
                        ) : (
                            <>
                                {overviewData.instructorGrowthRate > 0 ? (
                                    <TrendingUp className="w-4 h-4 mr-1"/>
                                ) : (
                                    <TrendingDown className="w-4 h-4 mr-1"/>
                                )}
                                <span>
                                    {overviewData.instructorGrowthRate > 0 ? '+' : ''}
                                    {overviewData.instructorGrowthRate.toFixed(1)}% so với tháng trước
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Issues & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Issues */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Vấn đề cần xử lý</h2>
                    <div className="space-y-4">
                        <div className="flex items-start p-4 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3"/>
                            <div>
                                <h3 className="text-sm font-medium text-red-900">3 báo cáo vi phạm mới</h3>
                                <p className="text-sm text-red-600">Cần kiểm tra và xử lý</p>
                            </div>
                        </div>
                        <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3"/>
                            <div>
                                <h3 className="text-sm font-medium text-yellow-900">5 yêu cầu rút tiền</h3>
                                <p className="text-sm text-yellow-600">Đang chờ xác nhận</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors">
                            <h3 className="text-sm font-medium text-blue-900">Duyệt khóa học</h3>
                            <p className="text-sm text-blue-600">8 khóa học mới</p>
                        </button>
                        <button className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors">
                            <h3 className="text-sm font-medium text-purple-900">Xét duyệt giảng viên</h3>
                            <p className="text-sm text-purple-600">3 yêu cầu mới</p>
                        </button>
                        <button className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors">
                            <h3 className="text-sm font-medium text-green-900">Quản lý thanh toán</h3>
                            <p className="text-sm text-green-600">12 giao dịch</p>
                        </button>
                        <button className="p-4 bg-orange-50 rounded-lg text-left hover:bg-orange-100 transition-colors">
                            <h3 className="text-sm font-medium text-orange-900">Báo cáo hệ thống</h3>
                            <p className="text-sm text-orange-600">Xem chi tiết</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Thống kê doanh thu</h2>
                        <select
                            className="px-3 py-2 border rounded-lg text-sm"
                            value={monthsCount === 6 ? "6 tháng gần nhất" : "12 tháng gần nhất"}
                            onChange={(e) => {
                                const value = e.target.value === "6 tháng gần nhất" ? 6 : 12;
                                setMonthsCount(value);
                            }}
                        >
                            <option value="6 tháng gần nhất">6 tháng gần nhất</option>
                            <option value="12 tháng gần nhất">12 tháng gần nhất</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={revenueData}
                                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#6b7280' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    label={{
                                        value: "Doanh thu (VNĐ)",
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: {
                                            textAnchor: 'middle',
                                            fontSize: 13,
                                            fill: '#666'
                                        },
                                        offset: 5,
                                        dx: -10
                                    }}
                                    tick={{ fill: '#6b7280' }}
                                    tickFormatter={(value) => {
                                        if (value === 0) return '0';
                                        if (value < 1000000) {
                                            return new Intl.NumberFormat('vi-VN', {
                                                maximumFractionDigits: 1,
                                                notation: 'compact',
                                                compactDisplay: 'short'
                                            }).format(value);
                                        }
                                        return `${(value/1000000).toFixed(1)}M`;
                                    }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value.toLocaleString()} VND`, 'Doanh thu']}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    cursor={{ stroke: '#2563eb', strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="none"
                                    fill="url(#colorRevenue)"
                                    animationDuration={1500}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2, r: 4 }}
                                    activeDot={{
                                        fill: '#2563eb',
                                        stroke: '#ffffff',
                                        strokeWidth: 2,
                                        r: 7,
                                    }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Course Distribution Chart */}
                {/*<div className="bg-white rounded-xl shadow-lg p-6">*/}
                    <CourseDistribution data={categoryDistribution}/>

                {/*</div>*/}
            </div>
        </div>
    );
};