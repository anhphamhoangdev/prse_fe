import React from 'react';
import {Globe, Pencil} from 'lucide-react';
import {CourseInstructorEdit} from "../../types/course";
import {RichTextEditor} from "../common/RichTextEditor";

interface BasicInfoPanelProps {
    course: CourseInstructorEdit;
    onInfoChange: (field: keyof CourseInstructorEdit, value: any) => void;
}

const BasicInfoPanel: React.FC<BasicInfoPanelProps> = ({ course, onInfoChange }) => {
    return (
        <div className="space-y-6">
            <div className="group">
                <label htmlFor="title"
                       className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-blue-600">
                    Tên khóa học
                </label>
                <input
                    id="title"
                    type="text"
                    value={course.title}
                    onChange={(e) => onInfoChange('title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-all duration-200 hover:border-blue-400 hover:shadow-md bg-white"
                    required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                    <label htmlFor="shortDescription"
                           className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-blue-600">
                        Mô tả ngắn
                    </label>
                    <input
                        id="shortDescription"
                        type="text"
                        value={course.shortDescription || ''}
                        onChange={(e) => onInfoChange('shortDescription', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition-all duration-200 hover:border-blue-400 hover:shadow-md bg-white"
                    />
                </div>

                <div className="group">
                    <label htmlFor="language"
                           className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-blue-600">
                        Ngôn ngữ
                    </label>
                    <div className="relative">
                        <select
                            id="language"
                            value={course.language}
                            onChange={(e) => onInfoChange('language', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            transition-all duration-200 hover:border-blue-400 hover:shadow-md appearance-none cursor-pointer bg-white"
                        >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">Tiếng Anh</option>
                        </select>
                        <div
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                            ▼
                        </div>
                    </div>
                </div>
            </div>

            <div className="group">
                <label htmlFor="description"
                       className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-hover:text-blue-600">
                    Mô tả chi tiết
                </label>
                <RichTextEditor
                    value={course.description || ''}
                    onChange={(content) => onInfoChange('description', content)}
                    id="description"
                    name="description"
                />
            </div>
        </div>
    );
};
export default BasicInfoPanel;