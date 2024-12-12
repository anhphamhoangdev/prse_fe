import React from "react";
import {PolicyCard} from "../components/common/PolicyCard";
import {BookOpen, CreditCard, Headphones, Lock, RefreshCcw, Shield} from "lucide-react";
import {BackButton} from "../components/common/BackButton";

export const Policies: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <BackButton/>

                <div className="text-center mb-12">
                    <div className="inline-block p-2 bg-blue-100 rounded-lg mb-4">
                        <Shield className="w-8 h-8 text-blue-600"/>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        Chính sách
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Cam kết của chúng tôi về quyền lợi và trách nhiệm của học viên
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <PolicyCard
                        icon={<CreditCard className="w-6 h-6 text-blue-500" />}
                        title="Chính sách thanh toán"
                        description="Đa dạng phương thức thanh toán, bảo mật thông tin và cam kết hoàn tiền trong 7 ngày"
                    />
                    <PolicyCard
                        icon={<BookOpen className="w-6 h-6 text-blue-500" />}
                        title="Quyền truy cập"
                        description="Truy cập vĩnh viễn vào nội dung khóa học và các cập nhật miễn phí"
                    />
                    <PolicyCard
                        icon={<Lock className="w-6 h-6 text-blue-500" />}
                        title="Bảo mật thông tin"
                        description="Cam kết bảo vệ thông tin cá nhân và không chia sẻ cho bên thứ ba"
                    />
                    <PolicyCard
                        icon={<Headphones className="w-6 h-6 text-blue-500" />}
                        title="Chính sách hỗ trợ khách hàng"
                        description="Hỗ trợ khách hàng 24/7 qua email và hotline để giải đáp mọi thắc mắc"
                    />
                </div>

                <div
                    className="mt-12 bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="w-8 h-8 text-blue-600"/>
                        </div>
                        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                            Cam kết của chúng tôi
                        </h2>
                    </div>
                    <div className="prose prose-blue max-w-none">
                        <p className="text-gray-600 leading-relaxed">
                            Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho học viên với đội ngũ giảng viên
                            chất lượng cao,
                            nội dung khóa học được cập nhật thường xuyên và hỗ trợ kỹ thuật 24/7.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};