import React, {useContext, useEffect, useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, LogOut, BookOpen, ChevronDown, Wallet, Award, GraduationCap, ArrowRight,
    Users, BookText, Percent, BarChart2, TrendingUp, DollarSign
} from "lucide-react";
import { InstructorData, UserData } from "../../types/users";
import { requestWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {InstructorContext} from "../../layouts/InstructorLayout";
import {formatTimeAgo} from "../../utils/formatLocalDateTimeToVN";


export interface RevenueStatistic {
    month: string;
    revenue: number;
}

export interface RevenueData {
    revenue_statistics: RevenueStatistic[];
}

interface RecentEnrollment {
    studentName: string;
    studentAvatar: string;
    courseName: string;
    enrolledAt: string;
}

interface RecentEnrollmentsData {
    recent_enrollments: RecentEnrollment[];
}


export const InstructorDashboard: React.FC = () => {

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { instructor } = useContext(InstructorContext);

    const [monthsCount, setMonthsCount] = useState(3);

    const [enrollments, setEnrollments] = useState<RecentEnrollment[]>([]);
    const [revenueData, setRevenueData] = useState<RevenueStatistic[]>([]);


    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await requestWithAuth<{ student: UserData }>(ENDPOINTS.STUDENT.PROFILE);
                const userData = response.student;
                setUser(userData);
                // Uncomment when API is ready
                // const instructorResponse = await requestWithAuth<{ instructor: InstructorData }>(ENDPOINTS.INSTRUCTOR.PROFILE);
                // setInstructor(instructorResponse.instructor);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                navigate('/login');
            }
        };

        checkAuthentication();
    }, [navigate]);

    useEffect(() => {
        const fetchRecentEnrollments = async () => {
            try {
                const response = await requestWithAuth<RecentEnrollmentsData>(
                    `${ENDPOINTS.INSTRUCTOR.RECENT_ENROLLMENT}`
                );
                setEnrollments(response.recent_enrollments);
            } catch (error) {
                console.error('Error fetching recent enrollments:', error);
            }
        };

        fetchRecentEnrollments();
    }, []);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await requestWithAuth<RevenueData>(
                    `${ENDPOINTS.INSTRUCTOR.REVENUE}?monthsCount=${monthsCount}`
                );
                setRevenueData(response.revenue_statistics);
            } catch (error) {
                console.error('Error fetching revenue data:', error);
            }
        };

        fetchRevenueData();
    }, [monthsCount]);

    const StatCard = ({ icon: Icon, title, value, trend, color }: {
        icon: any;
        title: string;
        value: string;
        trend?: string;
        color: string;
    }) => (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-600">{title}</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                    {trend && (
                        <p className="text-sm text-green-600 mt-1 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {trend}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex justify-between items-center">
                <div>
                    <div>
                        <div className="flex flex-col space-y-1.5">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                Chào {instructor?.fullName || user?.fullName}!
                            </h1>
                            {instructor?.title && (
                                <h2 className="text  text-slate-600">
                                    {instructor.title}
                                </h2>
                            )}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"/>
                            <p className="text-slate-600">
                                Đây là tổng quan hoạt động của bạn
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/instructor/upload')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <BookText className="w-4 h-4"/>
                    Tạo khóa học mới
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="Tổng học viên"
                    value={instructor?.totalStudent?.toString() || "0"}
                    // trend="+12% so với tháng trước"
                    color="bg-blue-500"
                />
                <StatCard
                    icon={BookText}
                    title="Khóa học"
                    value={instructor?.totalCourse?.toString() || "0"}
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={DollarSign}
                    title="Doanh thu"
                    value={`${(instructor?.money || 0).toLocaleString()} VND`}
                    // trend="+8.2% so với tháng trước"
                    color="bg-violet-500"
                />
                <StatCard
                    icon={Percent}
                    title="Phí platform"
                    value={`${instructor?.fee || 0}%`}
                    color="bg-amber-500"
                />
            </div>

            {/* Chart and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900">Doanh thu theo thời gian</h2>
                        <select
                            className="px-3 py-2 border rounded-lg text-sm"
                            value={monthsCount === 3 ? "3 tháng gần nhất" : "6 tháng gần nhất"}
                            onChange={(e) => {
                                const value = e.target.value === "3 tháng gần nhất" ? 3 : 6;
                                setMonthsCount(value);
                            }}
                        >
                            <option value="3 tháng gần nhất">3 tháng gần nhất</option>
                            <option value="6 tháng gần nhất">6 tháng gần nhất</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="month"/>
                                <YAxis/>
                                <Tooltip/>
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Enrollments */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                        Đăng ký gần đây
                    </h2>
                    <div className="space-y-4">
                        {enrollments.map((enrollment, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                                <div
                                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    {enrollment.studentAvatar ? (
                                        <img
                                            src={enrollment.studentAvatar}
                                            alt={enrollment.studentName}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-4 h-4 text-blue-600"/>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        Học viên {enrollment.studentName}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        đã đăng ký khóa học <strong>{enrollment.courseName}</strong>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {formatTimeAgo(enrollment.enrolledAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => navigate('/instructor/courses')}
                            className="w-full mt-4 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            Xem tất cả khóa học
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};