import React, { useState } from 'react';
import { Globe, BookOpen } from 'lucide-react';
import CurriculumEdit from "./CurriculumEdit";
import { CourseInfoEditProps } from "../../types/course";
import SettingPanel from "./SettingPanel";
import MediaPanel from "./MediaPanel";
import BasicInfoPanel from "./BasicInfoPanel";

const CourseInfoEdit: React.FC<CourseInfoEditProps> = ({
                                                           course,
                                                           chapters,
                                                           errorMessage,
                                                           onInfoChange,
                                                           onChaptersChange,
                                                           onInfoSubmit,
                                                           onCurriculumSubmit,
                                                           infoLoading,
                                                           curriculumLoading
                                                       }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');
    const [validationError, setValidationError] = useState<string>('');

    const validateCourseInfo = () => {
        // Kiểm tra các trường bắt buộc
        const requiredFields = {
            title: 'Tên khóa học',
            shortDescription: 'Mô tả ngắn',
            description: 'Mô tả chi tiết',
            language: 'Ngôn ngữ',
            imageUrl: 'Hình ảnh khóa học',
            previewVideoUrl: 'Video giới thiệu',
            originalPrice: 'Giá gốc'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!course[field as keyof typeof course]) {
                setValidationError(`Vui lòng điền đầy đủ thông tin: ${label}`);
                return false;
            }
        }

        if (Number(course.originalPrice) < 2000) {
            setValidationError('Giá gốc phải lớn hơn 2000');
            return false;
        }

        if (course.shortDescription.length > 250) {
            setValidationError('Mô tả ngắn không được vượt quá 150 ký tự');
            return false;
        }

        if (course.description.length > 5000) {
            setValidationError('Mô tả chi tiết không được vượt quá 5000 ký tự');
            return false;
        }

        setValidationError('');
        return true;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'info') {
            if (validateCourseInfo()) {
                onInfoSubmit(e);
            }
        } else {
            // if (validateCurriculum()) {
                onCurriculumSubmit(e);
            // }
        }
    };

    // const validateCurriculum = () => {
    //     if (!chapters.length) {
    //         setValidationError('Vui lòng thêm ít nhất một chương');
    //         return false;
    //     }
    //
    //     for (const chapter of chapters) {
    //         if (!chapter.title.trim()) {
    //             setValidationError('Tên chương không được để trống');
    //             return false;
    //         }
    //
    //         if (!chapter.lectures?.length) {
    //             setValidationError(`Chương "${chapter.title}" cần có ít nhất một bài giảng`);
    //             return false;
    //         }
    //
    //         for (const lecture of chapter.lectures) {
    //             if (!lecture.title.trim()) {
    //                 setValidationError('Tên bài giảng không được để trống');
    //                 return false;
    //             }
    //         }
    //     }
    //
    //     setValidationError('');
    //     return true;
    // };

    const tabs = [
        { id: 'info', label: 'Thông tin khóa học', icon: Globe },
        { id: 'curriculum', label: 'Nội dung khóa học', icon: BookOpen }
    ];

    const isLoading = activeTab === 'info' ? infoLoading : curriculumLoading;
    const submitButtonText = activeTab === 'info' ? 'Lưu thông tin' : 'Lưu nội dung';


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id as typeof activeTab)
                                setValidationError('');
                            }}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors 
                                ${activeTab === tab.id
                                ? 'bg-white text-blue-600 border-2 border-b-0 border-gray-200'
                                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                            }`}
                        >
                            <Icon className="w-4 h-4"/>
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-lg shadow">
                {/* Course Information Tab */}
                {activeTab === 'info' && (
                    <div className="divide-y divide-gray-200">
                        {/* Basic Information Section */}
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 pb-4 border-b border-gray-200">
                                Thông tin cơ bản
                            </h3>
                            <div className="mt-4">
                                <BasicInfoPanel course={course} onInfoChange={onInfoChange}/>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 pb-4 border-b border-gray-200">
                                Cài đặt khóa học
                            </h3>
                            <div className="mt-4">
                                <SettingPanel course={course} onInfoChange={onInfoChange}/>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 pb-4 border-b border-gray-200">
                                Hình ảnh & Video
                            </h3>
                            <div className="mt-4">
                                <MediaPanel course={course} onInfoChange={onInfoChange}/>
                            </div>
                        </div>
                    </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                    <div className="p-6">
                        <CurriculumEdit
                            course={course}
                            chapters={chapters}
                            onChaptersChange={onChaptersChange}
                        />
                    </div>
                )}
            </div>

            {validationError && (
                <div className="text-red-600 mt-4 p-4 bg-red-50 rounded-lg">
                    {validationError}
                </div>
            )}

            {errorMessage && (
                <div className="text-red-600 mt-4 p-4 bg-red-50 rounded-lg">
                    {errorMessage}
                </div>
            )}

            <div className="flex justify-end gap-4">
                {/*<button*/}
                {/*    type="button"*/}
                {/*    onClick={() => window.history.back()}*/}
                {/*    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"*/}
                {/*>*/}
                {/*    Hủy*/}
                {/*</button>*/}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Đang lưu...' : submitButtonText}
                </button>
            </div>
        </form>
    );
};

export default CourseInfoEdit;