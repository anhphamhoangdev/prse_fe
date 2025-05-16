import React, { useState, useEffect } from 'react';
import { Check, X, Search, RefreshCw, Eye, ArrowRight, Plus } from 'lucide-react';
import { putAdminWithAuth, requestAdminWithAuth, requestPostAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatLocalDateTimeToVN';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Định nghĩa interface như trong mã gốc
interface CategoryData {
    id: number;
    name: string;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

interface SubCategoryData {
    id: number;
    categoryId: number;
    name: string;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

interface CategoryResponse {
    categories: CategoryData[];
    totalElements: number;
}

interface SubCategoryResponse {
    category: CategoryData;
    subCategories: SubCategoryData[];
    totalElements: number;
}

const CategoryManagement = () => {
    // State management như trong mã gốc
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
    const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
    const [loadingSubCategories, setLoadingSubCategories] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryActive, setNewCategoryActive] = useState(true);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);
    const [originalCategories, setOriginalCategories] = useState<CategoryData[]>([]);
    const [savingOrder, setSavingOrder] = useState(false);

    const navigate = useNavigate();

    // useEffect để lấy danh sách categories (giữ nguyên như mã gốc)
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (searchTerm) queryParams.append('search', searchTerm);
                if (statusFilter) queryParams.append('status', statusFilter);

                const response = await requestAdminWithAuth<CategoryResponse>(`${ENDPOINTS.ADMIN.CATEGORIES}?${queryParams}`);
                if (response && response.categories) {
                    setCategories(response.categories);
                    setOriginalCategories(JSON.parse(JSON.stringify(response.categories)));
                    setTotalElements(response.totalElements);
                } else {
                    setCategories([]);
                    setOriginalCategories([]);
                    setTotalElements(0);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lấy danh sách thể loại');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchCategories, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    // Xử lý kéo-thả
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return; // Không làm gì nếu không thả vào vị trí hợp lệ

        const reorderedCategories = Array.from(categories);
        const [movedCategory] = reorderedCategories.splice(result.source.index, 1);
        reorderedCategories.splice(result.destination.index, 0, movedCategory);

        // Cập nhật orderIndex cho tất cả categories
        const updatedCategories = reorderedCategories.map((category, index) => ({
            ...category,
            orderIndex: index + 1,
        }));

        // Cập nhật state ngay lập tức để phản ánh giao diện
        setCategories(updatedCategories);
        setHasOrderChanged(true);
    };

    // Lưu thứ tự mới xuống backend
    const saveNewOrder = async () => {
        if (!hasOrderChanged) return;

        setSavingOrder(true);
        try {
            // Tạo danh sách các cặp id và orderIndex mới để gửi xuống backend
            const orderUpdates = categories.map((category, index) => ({
                id: category.id,
                orderIndex: index + 1
            }));

            // Gửi một request duy nhất để cập nhật tất cả thứ tự
            await requestPostAdminWithAuth(`${ENDPOINTS.ADMIN.CATEGORIES}/update-order`, {
                categoryOrders: orderUpdates
            });

            setCreateSuccess('Đã cập nhật thứ tự thể loại thành công');

            // Lưu lại trạng thái mới như là trạng thái gốc
            setOriginalCategories(JSON.parse(JSON.stringify(categories)));
            setHasOrderChanged(false);

            // Tắt chế độ kéo thả sau khi lưu thành công
            setTimeout(() => {
                setIsDragModeEnabled(false);
                setCreateSuccess(null);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể cập nhật thứ tự thể loại');
            // Rollback state nếu có lỗi
            setCategories(JSON.parse(JSON.stringify(originalCategories)));
        } finally {
            setSavingOrder(false);
        }
    };

    // Hủy thay đổi thứ tự
    const cancelOrderChanges = () => {
        if (hasOrderChanged) {
            setCategories(JSON.parse(JSON.stringify(originalCategories)));
            setHasOrderChanged(false);
        }
        setIsDragModeEnabled(false);
    };

    // Các hàm khác giữ nguyên như mã gốc
    const toggleCategoryActive = async (categoryId: number) => {
        try {
            await putAdminWithAuth(`${ENDPOINTS.ADMIN.CATEGORIES}/${categoryId}/toggle-status`, {});
            setCategories(categories.map((category) =>
                category.id === categoryId ? { ...category, isActive: !category.isActive } : category
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái thể loại');
        }
    };

    const viewCategoryDetails = (categoryId: number) => {
        navigate(`/admin/category/${categoryId}`);
    };

    const openQuickView = async (category: CategoryData) => {
        setSelectedCategory(category);
        setModalOpen(true);
        setLoadingSubCategories(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            queryParams.append('status', statusFilter);
            const response = await requestAdminWithAuth<SubCategoryResponse>(`${ENDPOINTS.ADMIN.CATEGORIES}/${category.id}/sub-categories?${queryParams}`);
            setSubCategories(response?.subCategories || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lấy danh sách thể loại con');
        } finally {
            setLoadingSubCategories(false);
        }
    };

    const createNewCategory = async () => {
        setCreateError(null);
        setCreateSuccess(null);
        if (!newCategoryName.trim()) {
            setCreateError('Tên thể loại không được để trống');
            return;
        }
        try {
            // Tự động thiết lập thứ tự ở cuối danh sách
            const maxOrderIndex = categories.length > 0
                ? Math.max(...categories.map(category => category.orderIndex))
                : 0;

            const newCategory = {
                name: newCategoryName.trim(),
                isActive: newCategoryActive,
                orderIndex: maxOrderIndex + 1, // Luôn thêm vào cuối
            };
            const response = await requestPostAdminWithAuth<{ category: CategoryData }>(
                ENDPOINTS.ADMIN.CATEGORIES,
                newCategory
            );
            if (response && response.category) {
                setCategories([...categories, response.category]);
                setOriginalCategories([...categories, response.category]);
                setTotalElements(totalElements + 1);
                setCreateSuccess('Tạo thể loại thành công');
                setNewCategoryName('');
                setNewCategoryActive(true);
                setTimeout(() => setCreateModalOpen(false), 1500);
            }
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Không thể tạo thể loại mới');
        }
    };

    const openCreateModal = () => {
        setCreateModalOpen(true);
        setCreateError(null);
        setCreateSuccess(null);
    };

    const closeCreateModal = () => {
        setCreateModalOpen(false);
        setNewCategoryName('');
        setNewCategoryActive(true);
        setCreateError(null);
        setCreateSuccess(null);
    };

    const closeQuickViewModal = () => {
        setModalOpen(false);
        setSelectedCategory(null);
        setSubCategories([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý thể loại</h1>
                            <p className="text-gray-500 mt-1">Tổng số: {totalElements} thể loại</p>
                        </div>
                        <div className="flex gap-3">
                            {!isDragModeEnabled ? (
                                <>
                                    <button
                                        onClick={() => setIsDragModeEnabled(true)}
                                        className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Thay đổi thứ tự
                                    </button>
                                    <button
                                        onClick={openCreateModal}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm thể loại
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={cancelOrderChanges}
                                        className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        disabled={savingOrder}
                                    >
                                        <X className="h-4 w-4" />
                                        Hủy
                                    </button>
                                    <button
                                        onClick={saveNewOrder}
                                        className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                            !hasOrderChanged ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        disabled={!hasOrderChanged || savingOrder}
                                    >
                                        {savingOrder ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                        {savingOrder ? 'Đang lưu...' : 'Lưu thứ tự'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            {error}
                        </div>
                    )}

                    {createSuccess && (
                        <div className="mb-4 bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
                            <Check className="h-5 w-5" />
                            {createSuccess}
                        </div>
                    )}

                    {isDragModeEnabled && (
                        <div className="mb-4 bg-indigo-50 text-indigo-600 p-4 rounded-lg flex items-center gap-2">
                            <span className="text-lg">💡</span>
                            Chế độ thay đổi thứ tự đang được kích hoạt. Kéo và thả các thể loại để thay đổi vị trí, sau đó nhấn "Lưu thứ tự" để lưu lại thay đổi.
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên thể loại..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Không hoạt động</option>
                        </select>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="categories" isDropDisabled={!isDragModeEnabled}>
                            {(provided) => (
                                <div
                                    className="overflow-x-auto border border-gray-200 rounded-lg"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 text-gray-600">ID</th>
                                            <th className="px-6 py-3 text-gray-600">Tên thể loại</th>
                                            <th className="px-6 py-3 text-gray-600">Thứ tự</th>
                                            <th className="px-6 py-3 text-gray-600">Ngày tạo</th>
                                            <th className="px-6 py-3 text-gray-600">Ngày cập nhật</th>
                                            <th className="px-6 py-3 text-gray-600">Trạng thái</th>
                                            <th className="px-6 py-3 text-gray-600">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center">
                                                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                                </td>
                                            </tr>
                                        ) : categories.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                    Không tìm thấy thể loại nào
                                                </td>
                                            </tr>
                                        ) : (
                                            categories.map((category, index) => (
                                                <Draggable
                                                    key={category.id}
                                                    draggableId={category.id.toString()}
                                                    index={index}
                                                    isDragDisabled={!isDragModeEnabled}
                                                >
                                                    {(provided, snapshot) => (
                                                        <tr
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...(isDragModeEnabled ? provided.dragHandleProps : {})}
                                                            className={`${
                                                                snapshot.isDragging
                                                                    ? 'bg-blue-100'
                                                                    : isDragModeEnabled
                                                                        ? 'hover:bg-blue-50 cursor-grab'
                                                                        : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <td className="px-6 py-4 font-medium">{category.id}</td>
                                                            <td className="px-6 py-4">{category.name}</td>
                                                            <td className="px-6 py-4">{category.orderIndex}</td>
                                                            <td className="px-6 py-4">{formatDate(category.createdAt)}</td>
                                                            <td className="px-6 py-4">{formatDate(category.updatedAt)}</td>
                                                            <td className="px-6 py-4">
                                                                    <span
                                                                        className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                                                                            category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                        }`}
                                                                    >
                                                                        {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                                    </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-2">
                                                                    {!isDragModeEnabled ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => openQuickView(category)}
                                                                                className="px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                                Xem nhanh
                                                                            </button>
                                                                            <button
                                                                                onClick={() => viewCategoryDetails(category.id)}
                                                                                className="px-3 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                                                            >
                                                                                Xem chi tiết
                                                                            </button>
                                                                            <button
                                                                                onClick={() => toggleCategoryActive(category.id)}
                                                                                className={`px-3 py-1 rounded-lg border transition-colors ${
                                                                                    category.isActive
                                                                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                                                                }`}
                                                                            >
                                                                                {category.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <div className="px-3 py-1 text-blue-600 font-medium flex items-center gap-2">
                                                                            <span className="text-xs">Kéo để thay đổi vị trí</span>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            {/* Modal for Quick View (giữ nguyên như mã gốc) */}
            {modalOpen && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Thể loại con của: {selectedCategory.name}
                            </h2>
                            <button
                                onClick={closeQuickViewModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                            {loadingSubCategories ? (
                                <div className="py-8 text-center">
                                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                </div>
                            ) : subCategories.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    Không có thể loại con nào
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 text-gray-600">ID</th>
                                            <th className="px-6 py-3 text-gray-600">Tên thể loại con</th>
                                            <th className="px-6 py-3 text-gray-600">Thứ tự</th>
                                            <th className="px-6 py-3 text-gray-600">Ngày tạo</th>
                                            <th className="px-6 py-3 text-gray-600">Trạng thái</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {subCategories.map((subCategory) => (
                                            <tr key={subCategory.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{subCategory.id}</td>
                                                <td className="px-6 py-4">{subCategory.name}</td>
                                                <td className="px-6 py-4">{subCategory.orderIndex}</td>
                                                <td className="px-6 py-4">{formatDate(subCategory.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                        <span
                                                            className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                                                                subCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {subCategory.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-between">
                            <button
                                onClick={closeQuickViewModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    closeQuickViewModal();
                                    viewCategoryDetails(selectedCategory.id);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                Xem chi tiết thể loại
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Create New Category */}
            {createModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Tạo thể loại mới</h2>
                            <button
                                onClick={closeCreateModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            {createError && (
                                <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-lg">
                                    {createError}
                                </div>
                            )}
                            {createSuccess && (
                                <div className="mb-4 bg-green-50 text-green-600 p-4 rounded-lg">
                                    {createSuccess}
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên thể loại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="categoryName"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Nhập tên thể loại"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={newCategoryActive}
                                        onChange={(e) => setNewCategoryActive(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                        Kích hoạt
                                    </label>
                                </div>
                                <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600">
                                        <span className="font-medium">Lưu ý:</span> Thể loại mới sẽ được thêm vào cuối danh sách.
                                        Bạn có thể thay đổi thứ tự hiển thị sau bằng cách sử dụng chức năng "Thay đổi thứ tự".
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={closeCreateModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={createNewCategory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Tạo thể loại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;