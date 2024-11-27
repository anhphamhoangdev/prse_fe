import React, {ChangeEvent, FormEvent, useCallback, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UploadCloud, Film, Image, Info, DollarSign, Globe, BookOpen, Award, Eye, LucideIcon} from "lucide-react";
import {CourseFormData} from "../../types/upload-courses";
import {FormInput} from "../../components/instructor/FormInput";
import {FileDropZone} from "../../components/instructor/FileDropZone";

const UploadCourse: React.FC = () => {
    const [formData, setFormData] = useState<CourseFormData>({
        title: "",
        description: "",
        shortDescription: "",
        language: "",
        originalPrice: 0,
        isDiscount: false,
        isHot: false,
        isPublish: false,
    });

    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const [errors, setErrors] = useState<{[key: string]: string}>({});



    const [videoDuration, setVideoDuration] = useState<number | undefined>();


    const navigate = useNavigate();


    // validate
    const validateStep1 = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Vui lòng nhập tên khóa học';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Vui lòng nhập mô tả khóa học';
        } else if (formData.description.trim().length < 50) {
            newErrors.description = 'Mô tả khóa học phải có ít nhất 50 ký tự';
        }

        if (!formData.shortDescription.trim()) {
            newErrors.shortDescription = 'Vui lòng nhập mô tả ngắn';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const validateStep2 = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.language) {
            newErrors.language = 'Vui lòng chọn ngôn ngữ';
        }

        if (!formData.originalPrice || formData.originalPrice <= 0) {
            newErrors.originalPrice = 'Vui lòng nhập giá hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        // Clear error khi user nhập
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("Course Data:", formData);
        // Handle form submission
    };

    const handleVideoChange = (file: File | null, duration?: number) => {
        setSelectedVideo(file);
        setVideoDuration(duration);
    };

    const handleImageChange = (file: File | null) => {
        setSelectedImage(file);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const nextStep = () => {
        let isValid = false;

        switch (currentStep) {
            case 1:
                isValid = validateStep1();
                break;
            case 2:
                isValid = validateStep2();
                break;
        }

        if (isValid) {
            setCurrentStep(currentStep + 1);
            setErrors({});  // Clear errors khi chuyển step
        }
    };

    const renderError = (fieldName: string) => {
        if (errors[fieldName]) {
            return (
                <p className="mt-1 text-sm text-red-500">
                    {errors[fieldName]}
                </p>
            );
        }
        return null;
    };

    const handleStepClick = (step: number) => {
        // Chỉ cho phép navigate tới các step đã hoàn thành hoặc step ngay tiếp theo
        if (step <= currentStep) {
            setCurrentStep(step);
        } else if (step === currentStep + 1) {
            let isValid = false;

            switch (currentStep) {
                case 1:
                    isValid = validateStep1();
                    break;
                case 2:
                    isValid = validateStep2();
                    break;
            }

            if (isValid) {
                setCurrentStep(step);
                setErrors({});
            }
        }
    };


    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-white p-8 sm:p-12">
            <div className="max-w-3xl w-full self-center bg-white rounded-lg shadow-xl p-8 sm:p-12 mb-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Tạo Khóa Học Mới</h1>
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((step) => (
                            <React.Fragment key={step}>
                                <div
                                    onClick={() => handleStepClick(step)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold 
                    transition-all duration-200
                    ${step === currentStep
                                        ? 'bg-blue-600'
                                        : step < currentStep
                                            ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                                            : step === currentStep + 1
                                                ? 'bg-blue-200 cursor-pointer hover:bg-blue-300'
                                                : 'bg-blue-200 cursor-not-allowed'
                                    }
                    ${step <= currentStep + 1 ? 'transform hover:scale-110' : ''}`}
                                >
                                    {step < currentStep ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M5 13l4 4L19 7"/>
                                        </svg>
                                    ) : (
                                        step
                                    )}
                                </div>
                                {step < 3 && (
                                    <div className={`h-0.5 w-16 transition-colors duration-200 ${
                                        step < currentStep ? 'bg-green-500' : 'bg-blue-200'
                                    }`}/>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="min-h-[400px]"> {/* Fixed height container for form content */}
                        {currentStep === 1 && (
                            <div className="space-y-8 animate-fade-in min-h-[400px]">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên Khóa Học
                                    </label>
                                    <FormInput
                                        icon={BookOpen}
                                        type="text"
                                        name="title"
                                        id="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Nhập tên khóa học hấp dẫn"
                                        required
                                        error={errors.title}  // Thêm prop error vào FormInput component
                                    />
                                    {renderError('title')}
                                </div>

                                <div>
                                    <label htmlFor="description"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô Tả Khóa Học
                                    </label>
                                    <textarea
                                        rows={5}
                                        name="description"
                                        id="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="block w-full border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out sm:text-sm hover:border-gray-400 p-3"
                                        placeholder="Viết mô tả thú vị về khóa học của bạn"
                                        required
                                    />
                                    {renderError('description')}
                                </div>

                                <div>
                                    <label htmlFor="shortDescription"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô Tả Ngắn Gọn
                                    </label>
                                    <FormInput
                                        icon={Info}
                                        type="text"
                                        name="shortDescription"
                                        id="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleChange}
                                        placeholder="Tóm tắt khóa học của bạn"
                                        error={errors.shortDescription}
                                        required
                                    />
                                    {renderError('shortDescription')}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8 animate-fade-in min-h-[400px]">
                                <div>
                                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngôn Ngữ
                                    </label>
                                    <div className="relative rounded-md shadow-md">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Globe className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="language"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out sm:text-sm hover:border-gray-400"
                                            required
                                        >
                                            <option value="">Chọn ngôn ngữ</option>
                                            <option value="en">English</option>
                                            <option value="vi">Tiếng Việt</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                            <option value="es">Español</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                                        Giá (VNĐ)
                                    </label>
                                    <FormInput
                                        icon={DollarSign}
                                        type="number"
                                        name="originalPrice"
                                        id="originalPrice"
                                        min="0"
                                        step="1000"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        placeholder="0 VND"
                                        error={errors.originalPrice}
                                        required
                                    />
                                    {renderError('originalPrice')}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate-fade-in min-h-[400px]">
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ảnh Khóa Học
                                        </label>
                                        <FileDropZone
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            value={selectedImage}
                                            type="image"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Video Giới Thiệu Khóa Học
                                        </label>
                                        <FileDropZone
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                            value={selectedVideo}
                                            type="video"
                                            duration={videoDuration}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Cài Đặt Khóa Học</h3>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-start">
                                            <div className="h-5 flex items-center">
                                                <input
                                                    id="isPublish"
                                                    name="isPublish"
                                                    type="checkbox"
                                                    checked={formData.isPublish}
                                                    onChange={handleChange}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="isPublish" className="font-medium text-gray-700">
                                                    Công Khai Ngay
                                                </label>
                                                <p className="text-gray-500">
                                                    Khóa học của bạn sẽ được công khai ngay khi tạo.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="h-20 mt-12 flex justify-end items-center border-t border-gray-200 pt-4">
                        <div className="flex space-x-3">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Quay Lại
                                </button>
                            )}
                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Tiếp Tục
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <UploadCloud className="mr-2 h-5 w-5" aria-hidden="true"/>
                                    Tạo Khóa Học
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div className="text-center">
                <p className="text-gray-500 text-sm">Chúng tôi rất hào hứng được xem bạn sẽ dạy gì! Nếu có bất cứ câu
                    hỏi nào, đội ngũ hỗ trợ thân thiện của chúng tôi luôn sẵn sàng giúp đỡ.</p>
            </div>
        </div>
    );
}

export default UploadCourse;