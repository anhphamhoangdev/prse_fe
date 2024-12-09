import React, {ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import {UploadCloud, Film, Image, Info, DollarSign, Globe, BookOpen, Award, Eye, LucideIcon} from "lucide-react";
import {CourseFormData} from "../../types/upload-courses";
import {FormInput} from "../../components/instructor/FormInput";
import {FileDropZone} from "../../components/instructor/FileDropZone";
import {requestPostFormDataWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";
import {Category} from "../../models/Category";
import {getCategories} from "../../services/categoryService";
import {RichTextEditor} from "../../components/common/RichTextEditor";

interface CourseResponse {
    id: number;
    averageRating?: number;        // Có thể không có giá trị
    createdAt?: Date;              // Ngày tạo, có thể không có
    description?: string;          // Mô tả, có thể không có
    imageUrl?: string;             // Đường dẫn đến hình ảnh, có thể không có
    instructorId?: number;         // ID của giảng viên, có thể không có
    isDiscount?: boolean;          // Trạng thái giảm giá
    isHot?: boolean;               // Trạng thái nổi bật
    isPublish?: boolean;           // Trạng thái công khai
    language: string;              // Ngôn ngữ
    originalPrice: number;         // Giá gốc
    shortDescription?: string;     // Mô tả ngắn gọn, có thể không có
    title: string;                 // Tiêu đề của khóa học
    totalStudents?: number;        // Tổng số học viên, có thể không có
    totalViews?: number;           // Tổng số lượt xem, có thể không có
    updatedAt?: Date;              // Ngày cập nhật, có thể không có
    previewVideoDuration?: string; // Thời gian video giới thiệu, có thể không có
    previewVideoUrl?: string;      // Đườn
}

interface UploadCourseResponse {
    course: CourseResponse;
}

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
        subCategoryIds: [],
        prerequisites: [],   // Khởi tạo mảng rỗng
        objectives: [],     // Khởi tạo mảng rỗng
    });


    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const [isLoading, setIsLoading] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);

    const [videoDuration, setVideoDuration] = useState<number | undefined>();

    const [formattedPrice, setFormattedPrice] = useState<string>("0");


    const navigate = useNavigate();


    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getCategories();
            setCategories(data);
        };
        fetchCategories();
    }, []);



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

        // Validate prerequisites và objectives nếu cần
        if (formData.prerequisites.some(p => !p.trim())) {
            newErrors.prerequisites = 'Vui lòng điền đầy đủ thông tin kiến thức cần có';
        }

        if (formData.objectives.some(o => !o.trim())) {
            newErrors.objectives = 'Vui lòng điền đầy đủ thông tin mục tiêu khóa học';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep4 = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (!selectedImage) {
            newErrors.image = 'Vui lòng chọn ảnh cho khóa học';
        }

        if (!selectedVideo) {
            newErrors.video = 'Vui lòng chọn video giới thiệu khóa học';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (formData.subCategoryIds.length === 0) {
            newErrors.subCategories = 'Vui lòng chọn ít nhất một danh mục phụ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: string; type?: string } }
    ) => {
        const { name, value, type } = e.target;

        // Xử lý checkbox
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        }
        // Xử lý originalPrice
        else if (name === "originalPrice") {
            const numericValue = unformatNumber(value);
            if (!isNaN(numericValue)) {
                setFormData({ ...formData, [name]: numericValue });
                setFormattedPrice(formatNumber(numericValue));
            }
        }
        // Xử lý các trường hợp còn lại (bao gồm cả RichTextEditor)
        else {
            setFormData({ ...formData, [name]: value });
        }

        // Xóa lỗi nếu có
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const formatNumber = (value: number): string => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const unformatNumber = (value: string): number => {
        return parseInt(value.replace(/\./g, ""), 10);
    };

    const handleSubCategoryChange = (subCategoryId: number, checked: boolean) => {
        let newSubCategories: number[];

        if (checked) {
            if (formData.subCategoryIds.length >= 4) return;
            newSubCategories = [...formData.subCategoryIds, subCategoryId];
        } else {
            newSubCategories = formData.subCategoryIds.filter(id => id !== subCategoryId);
        }

        setFormData({
            ...formData,
            subCategoryIds: newSubCategories
        });
    };

    const handlePrerequisiteAdd = () => {
        setFormData({
            ...formData,
            prerequisites: [...formData.prerequisites, ""]
        });
    };

    const handlePrerequisiteChange = (index: number, value: string) => {
        const newPrerequisites = [...formData.prerequisites];
        newPrerequisites[index] = value;
        setFormData({
            ...formData,
            prerequisites: newPrerequisites
        });
    };

    const handlePrerequisiteRemove = (index: number) => {
        setFormData({
            ...formData,
            prerequisites: formData.prerequisites.filter((_, i) => i !== index)
        });
    };

    const handleObjectiveAdd = () => {
        setFormData({
            ...formData,
            objectives: [...formData.objectives, ""]
        });
    };

    const handleObjectiveChange = (index: number, value: string) => {
        const newObjectives = [...formData.objectives];
        newObjectives[index] = value;
        setFormData({
            ...formData,
            objectives: newObjectives
        });
    };

    const handleObjectiveRemove = (index: number) => {
        setFormData({
            ...formData,
            objectives: formData.objectives.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true); // Start loading

        // Validate tất cả các bước
        const step1Valid = validateStep1();
        const step2Valid = validateStep2();
        const step3Valid = validateStep3();
        const step4Valid = validateStep4();

        if (!step1Valid) {
            setCurrentStep(1);
            return;
        }
        if (!step2Valid) {
            setCurrentStep(2);
            return;
        }
        if (!step3Valid) {
            setCurrentStep(3);
            return;
        }

        if (!step4Valid) {
            setCurrentStep(4);
            setIsLoading(false); // Start loading
            alert('Vui lòng chọn ảnh và video preview cho khoá học !')
            return;
        }

        try {
            // Kiểm tra lại một lần nữa trước khi upload
            if (!selectedImage || !selectedVideo) {
                setErrors({
                    ...errors,
                    submit: 'Vui lòng chọn đầy đủ ảnh và video cho khóa học'
                });
                setCurrentStep(4);
                return;
            }

            const courseData: CourseFormData = {
                title: formData.title,
                description: formData.description,
                shortDescription: formData.shortDescription,
                language: formData.language,
                originalPrice: formData.originalPrice,
                isDiscount: formData.isDiscount,
                isHot: formData.isHot,
                isPublish: formData.isPublish,
                previewVideoDuration: videoDuration || 0,
                subCategoryIds: formData.subCategoryIds,
                prerequisites: formData.prerequisites,
                objectives: formData.objectives
                // Thêm dòng này
            };

            // Tạo FormData cho cả ảnh và dữ liệu khóa học
            const formDataToSend = new FormData();
            formDataToSend.append('image', selectedImage);
            formDataToSend.append('data', JSON.stringify(courseData));

            // Gọi API để tải lên dữ liệu khóa học và ảnh
            const response = await requestPostFormDataWithAuth<UploadCourseResponse>(
                `${ENDPOINTS.INSTRUCTOR.UPLOAD_COURSE}`,
                formDataToSend
            );

            const courseId = response.course.id;

            // Tải lên video
            const videoFormData = new FormData();
            videoFormData.append('video', selectedVideo);
            videoFormData.append('courseId', JSON.stringify(courseId));

            // Gọi API để tải lên video
            requestPostFormDataWithAuth<{ success: boolean }>(
                `${ENDPOINTS.INSTRUCTOR.UPLOAD_PREVIEW_VIDEO}`,
                videoFormData
            );


            // Redirect to course edit page
            navigate(`/instructor/courses`);

        } catch (error) {
            console.error('Error creating course:', error);
            setErrors({
                submit: 'Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại.'
            });
        }finally {
            setIsLoading(false); // Stop loading
        }
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
            case 3:
                isValid = validateStep3();  // Thêm validation cho step 3
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
                case 3:
                    isValid = validateStep3();  // Thêm validation cho step 3
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
                        {[1, 2, 3, 4].map((step) => (  // Thay đổi từ [1, 2, 3] thành [1, 2, 3, 4]
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
                                {step < 4 && (  // Thay đổi từ step < 3 thành step < 4
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
                                    <RichTextEditor
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={(content) => {
                                        // Cập nhật handleChange để xử lý rich text
                                        handleChange({
                                            target: {
                                                name: 'description',
                                                value: content
                                            }
                                        });
                                    }}
                                        error={errors.description}
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
                                            <Globe className="h-5 w-5 text-gray-400"/>
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
                                    <label htmlFor="originalPrice"
                                           className="block text-sm font-medium text-gray-700 mb-1">
                                        Giá (VNĐ)
                                    </label>
                                    <FormInput
                                        icon={DollarSign}
                                        type="text" // Đổi type từ number thành text
                                        name="originalPrice"
                                        id="originalPrice"
                                        value={formattedPrice}
                                        onChange={(e) => {
                                            // Chỉ cho phép nhập số
                                            const value = e.target.value.replace(/[^\d]/g, '');
                                            if (value) {
                                                const numericValue = parseInt(value, 10);
                                                setFormData({ ...formData, originalPrice: numericValue });
                                                setFormattedPrice(formatNumber(numericValue));
                                            } else {
                                                setFormData({ ...formData, originalPrice: 0 });
                                                setFormattedPrice("0");
                                            }
                                        }}
                                        onFocus={(e) => {
                                            // Khi focus vào input, hiển thị giá trị không có dấu chấm
                                            e.target.value = formData.originalPrice.toString();
                                        }}
                                        onBlur={(e) => {
                                            // Khi blur khỏi input, format lại số
                                            setFormattedPrice(formatNumber(formData.originalPrice));
                                        }}
                                        placeholder="0 VND"
                                        error={errors.originalPrice}
                                        required
                                    />
                                    {renderError('originalPrice')}
                                </div>

                                <div className="space-y-6">
                                    {/* Prerequisites Section */}
                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Kiến thức cần
                                                    có</h3>
                                                <p className="text-sm text-gray-500">Liệt kê những kiến thức học viên
                                                    cần có trước khi tham gia khóa học</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handlePrerequisiteAdd}
                                                className="inline-flex items-center px-3 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M12 4v16m8-8H4"/>
                                                </svg>
                                                Thêm kiến thức
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.prerequisites.map((prerequisite, index) => (
                                                <div key={index}
                                                     className="group relative bg-white p-4 rounded-md border border-gray-200 shadow-sm hover:border-blue-200">
                                                    <div className="flex items-center">
                        <span
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3">
                            {index + 1}
                        </span>
                                                        <input
                                                            type="text"
                                                            value={prerequisite}
                                                            onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                                                            placeholder="VD: Kiến thức cơ bản về lập trình"
                                                            className="flex-1 focus:outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors bg-transparent p-1 text-gray-900 placeholder-gray-400 sm:text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrerequisiteRemove(index)}
                                                            className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-red-500 transition-opacity"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor"
                                                                 viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                      strokeWidth={2}
                                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {formData.prerequisites.length === 0 && (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    Chưa có kiến thức nào được thêm
                                                </div>
                                            )}
                                            {errors.prerequisites && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.prerequisites}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Objectives Section */}
                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Mục tiêu khóa
                                                    học</h3>
                                                <p className="text-sm text-gray-500">Những gì học viên sẽ đạt được sau
                                                    khi hoàn thành khóa học</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleObjectiveAdd}
                                                className="inline-flex items-center px-3 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M12 4v16m8-8H4"/>
                                                </svg>
                                                Thêm mục tiêu
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.objectives.map((objective, index) => (
                                                <div key={index}
                                                     className="group relative bg-white p-4 rounded-md border border-gray-200 shadow-sm hover:border-blue-200">
                                                    <div className="flex items-center">
                        <span
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-sm font-medium mr-3">
                            {index + 1}
                        </span>
                                                        <input
                                                            type="text"
                                                            value={objective}
                                                            onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                                            placeholder="VD: Hiểu được các khái niệm cơ bản"
                                                            className="flex-1 focus:outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-500 transition-colors bg-transparent p-1 text-gray-900 placeholder-gray-400 sm:text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleObjectiveRemove(index)}
                                                            className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-red-500 transition-opacity"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor"
                                                                 viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                      strokeWidth={2}
                                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {formData.objectives.length === 0 && (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    Chưa có mục tiêu nào được thêm
                                                </div>
                                            )}
                                            {errors.objectives && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.objectives}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate-fade-in min-h-[400px]">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Chọn Danh Mục (Tối đa 4)</h2>
                                <p className="text-sm text-gray-500 mb-6">
                                    Đã chọn {formData.subCategoryIds.length}/4 danh mục
                                </p>
                                {errors.subCategories && (
                                    <p className="mt-4 text-lg text-red-500">
                                        {errors.subCategories}
                                    </p>
                                )}

                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2">
                                    {categories.map((category) => (
                                        <div key={category.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                            <h3 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                                {category.name}
                                                <span className="text-sm text-gray-500 ml-2">
                            ({category.subCategories.length})
                        </span>
                                            </h3>
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                                {category.subCategories.map((sub) => {
                                                    const isChecked = formData.subCategoryIds.includes(sub.id);
                                                    const isDisabled = !isChecked && formData.subCategoryIds.length >= 4;

                                                    return (
                                                        <label
                                                            key={sub.id}
                                                            className={`flex items-center p-2 rounded hover:bg-gray-100 transition-colors
                                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        ${isChecked ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => handleSubCategoryChange(sub.id, e.target.checked)}
                                                                disabled={isDisabled}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <span className="ml-2 flex-1 text-sm">
                                        {sub.name}
                                    </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>


                                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Danh mục đã chọn:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.subCategoryIds.map(subId => {
                                            const category = categories.find(c =>
                                                c.subCategories.some(sub => sub.id === subId)
                                            );
                                            const subcategory = category?.subCategories.find(sub => sub.id === subId);

                                            return subcategory && (
                                                <div key={subId}
                                                     className="inline-flex items-center bg-white px-3 py-1 rounded-full border border-blue-200">
                                                    <span className="text-sm text-blue-800">{subcategory.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSubCategoryChange(subId, false)}
                                                        className="ml-2 text-blue-400 hover:text-blue-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
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

                            {currentStep < 4 && (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Tiếp Tục
                                </button>
                            )}

                            {currentStep === 4 && (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 fill="none"
                                                 viewBox="0 0 24 24">
                                                <circle className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4">
                                                </circle>
                                                <path className="opacity-75"
                                                      fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                </path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="mr-2 h-5 w-5" aria-hidden="true"/>
                                            Tạo Khóa Học
                                        </>
                                    )}
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