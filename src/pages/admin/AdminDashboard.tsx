import React from 'react';
import { TrendingUp, Users, BookOpen, DollarSign, AlertCircle, Award } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell
} from 'recharts';

const revenueData = [
    { month: 'T1', revenue: 35000000 },
    { month: 'T2', revenue: 42000000 },
    { month: 'T3', revenue: 38000000 },
    { month: 'T4', revenue: 45000000 },
    { month: 'T5', revenue: 52000000 },
    { month: 'T6', revenue: 49000000 },
    { month: 'T7', revenue: 58000000 },
    { month: 'T8', revenue: 63000000 },
    { month: 'T9', revenue: 59000000 },
    { month: 'T10', revenue: 66000000 },
    { month: 'T11', revenue: 72000000 },
    { month: 'T12', revenue: 85000000 },
];

const courseDistributionData = [
    { name: 'Công nghệ thông tin', value: 35 },
    { name: 'Kinh doanh', value: 25 },
    { name: 'Ngoại ngữ', value: 20 },
    { name: 'Marketing', value: 15 },
    { name: 'Khác', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];


export const AdminDashboard = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                            <p className="text-2xl font-bold text-gray-900">2,543</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+12.5% so với tháng trước</span>
                    </div>
                </div>

                {/* Total Courses */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Số khóa học</p>
                            <p className="text-2xl font-bold text-gray-900">152</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+5.2% so với tháng trước</span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                            <p className="text-2xl font-bold text-gray-900">45.2M VND</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+8.1% so với tháng trước</span>
                    </div>
                </div>

                {/* Active Instructors */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Giảng viên</p>
                            <p className="text-2xl font-bold text-gray-900">48</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <Award className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+3 giảng viên mới</span>
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
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-red-900">3 báo cáo vi phạm mới</h3>
                                <p className="text-sm text-red-600">Cần kiểm tra và xử lý</p>
                            </div>
                        </div>
                        <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
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
                {/* Revenue Chart giữ nguyên */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Thống kê doanh thu</h2>
                    <div className="w-full h-[300px] flex justify-center">
                        <BarChart
                            width={600} // Change to a percentage or a smaller fixed size
                            height={300}
                            data={revenueData}
                            // Adding responsive behavior
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="month"/>
                            <YAxis tickFormatter={(value) => `${value / 1000000}M`}/>
                            <Tooltip formatter={(value) => `${value.toLocaleString()} VND`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#0088FE" name="Doanh thu" />
                        </BarChart>
                    </div>
                </div>
                {/* Điều chỉnh Course Distribution Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Phân bố khóa học</h2>
                    <div className="flex justify-center">
                        <PieChart width={400} height={300}>
                            <Pie
                                data={courseDistributionData}
                                cx={200} // Center the pie chart horizontally
                                cy={150} // Center the pie chart vertically
                                labelLine={true}
                                outerRadius={80}
                                label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {courseDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} khóa học`, name]} />
                            <Legend
                                layout="vertical"
                                align="right" // Align legend to the right to avoid overlap
                                verticalAlign="middle"
                                wrapperStyle={{
                                    paddingLeft: "20px",
                                    paddingTop: "10px",
                                }}
                            />
                        </PieChart>
                    </div>
                </div>
            </div>
        </div>
    );
};