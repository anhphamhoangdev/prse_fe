import React from 'react';
import { DollarSign, Star, Eye } from 'lucide-react';
import {CourseInstructorEdit} from "../../types/course";

interface SettingsPanelProps {
    course: CourseInstructorEdit;
    onInfoChange: (field: keyof CourseInstructorEdit, value: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ course, onInfoChange }) => {
    return (
        <div className="space-y-6">
            {/* Price Section */}
            <div className="group">
                <label htmlFor="originalPrice"
                       className="block text-sm font-medium text-gray-700 mb-2">
                    Giá gốc
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        id="originalPrice"
                        type="number"
                        value={course.originalPrice}
                        min={2000}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                        text-gray-500 cursor-not-allowed focus:outline-none"
                        onChange={(e) => onInfoChange('originalPrice', e.target.value)}
                    />

                </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-3">
                {/* Disabled Settings */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-md shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <label htmlFor="isDiscount" className="text-sm font-medium text-gray-700">
                                        Đang giảm giá
                                    </label>
                                    <p className="text-xs text-gray-500 mt-0.5">Trạng thái được quản lý tự động</p>
                                </div>
                            </div>
                            <input
                                id="isDiscount"
                                type="checkbox"
                                checked={course.isDiscount}
                                className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
                                disabled
                            />
                        </div>

                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-md shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <label htmlFor="isHot" className="text-sm font-medium text-gray-700">
                                        Khóa học nổi bật
                                    </label>
                                    <p className="text-xs text-gray-500 mt-0.5">Được cập nhật theo số lượng học viên</p>
                                </div>
                            </div>
                            <input
                                id="isHot"
                                type="checkbox"
                                checked={course.isHot}
                                className="h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
                                disabled
                            />
                        </div>
                    </div>
                </div>

                {/* Active Setting - isPublish */}
                <div className="relative group">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200
                        transition-all duration-300 hover:border-blue-500 hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center
                                transition-colors duration-300 group-hover:bg-blue-200">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <label htmlFor="isPublish" className="text-sm font-medium text-gray-700
                                    transition-colors duration-300 group-hover:text-blue-600">
                                    Xuất bản
                                </label>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {course.isPublish
                                        ? "Khóa học đang được hiển thị công khai"
                                        : "Khóa học đang ở chế độ riêng tư"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${course.isPublish
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'}`}>
                                {course.isPublish ? 'Đang hiển thị' : 'Đã ẩn'}
                            </span>
                            <input
                                id="isPublish"
                                type="checkbox"
                                checked={course.isPublish}
                                onChange={(e) => onInfoChange('isPublish', e.target.checked)}
                                className="h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer
                                    focus:ring-blue-500 transition-all duration-300
                                    hover:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;