import React, { useState, useEffect } from 'react';
import { Check, X, Search, RefreshCw, Plus, Edit, ArrowLeft } from 'lucide-react';
import { putAdminWithAuth, requestAdminWithAuth, requestPostAdminWithAuth } from '../../utils/request';
import { ENDPOINTS } from '../../constants/endpoint';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../../utils/formatLocalDateTimeToVN';
import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd';

// Interface definitions
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

interface SubCategoryResponse {
    category: CategoryData;
    subCategories: SubCategoryData[];
    totalElements: number;
}

const SubCategoryManagement = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    // State management
    const [category, setCategory] = useState<CategoryData | null>(null);
    const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);
    const [originalSubCategories, setOriginalSubCategories] = useState<SubCategoryData[]>([]);
    const [savingOrder, setSavingOrder] = useState(false);

    // Modal states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryData | null>(null);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [newSubCategoryActive, setNewSubCategoryActive] = useState(true);
    const [editName, setEditName] = useState('');
    const [editActive, setEditActive] = useState(true);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);

    // Fetch sub-categories
    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!categoryId) return;

            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (searchTerm) queryParams.append('search', searchTerm);
                if (statusFilter) queryParams.append('status', statusFilter);

                const response = await requestAdminWithAuth<SubCategoryResponse>(
                    `${ENDPOINTS.ADMIN.CATEGORIES}/${categoryId}/sub-categories?${queryParams}`
                );

                if (response) {
                    setCategory(response.category);
                    setSubCategories(response.subCategories || []);
                    setOriginalSubCategories(JSON.parse(JSON.stringify(response.subCategories || [])));
                    setTotalElements(response.totalElements || 0);
                } else {
                    setCategory(null);
                    setSubCategories([]);
                    setOriginalSubCategories([]);
                    setTotalElements(0);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lấy danh sách thể loại con');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSubCategories, 300);
        return () => clearTimeout(timeoutId);
    }, [categoryId, searchTerm, statusFilter]);

    // Drag and drop handling
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return; // Don't do anything if not dropped in a valid destination

        const reorderedSubCategories = Array.from(subCategories);
        const [movedSubCategory] = reorderedSubCategories.splice(result.source.index, 1);
        reorderedSubCategories.splice(result.destination.index, 0, movedSubCategory);

        // Update orderIndex for all subcategories
        const updatedSubCategories = reorderedSubCategories.map((subCategory, index) => ({
            ...subCategory,
            orderIndex: index + 1,
        }));

        // Update state immediately to reflect the interface
        setSubCategories(updatedSubCategories);
        setHasOrderChanged(true);
    };

    // Save new order to backend
    const saveNewOrder = async () => {
        if (!hasOrderChanged || !categoryId) return;

        setSavingOrder(true);
        try {
            // Create a list of id and new orderIndex pairs to send to backend
            const orderUpdates = subCategories.map((subCategory, index) => ({
                id: subCategory.id,
                orderIndex: index + 1
            }));

            // Send a single request to update all orders
            await requestPostAdminWithAuth(`${ENDPOINTS.ADMIN.CATEGORIES}/${categoryId}/sub-categories/update-order`, {
                subCategoryOrders: orderUpdates
            });

            setCreateSuccess('Đã cập nhật thứ tự thể loại con thành công');

            // Save the new state as the original state
            setOriginalSubCategories(JSON.parse(JSON.stringify(subCategories)));
            setHasOrderChanged(false);

            // Turn off drag mode after successful save
            setTimeout(() => {
                setIsDragModeEnabled(false);
                setCreateSuccess(null);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể cập nhật thứ tự thể loại con');
            // Rollback state if error
            setSubCategories(JSON.parse(JSON.stringify(originalSubCategories)));
        } finally {
            setSavingOrder(false);
        }
    };

    // Cancel order changes
    const cancelOrderChanges = () => {
        if (hasOrderChanged) {
            setSubCategories(JSON.parse(JSON.stringify(originalSubCategories)));
            setHasOrderChanged(false);
        }
        setIsDragModeEnabled(false);
    };

    // Toggle subcategory active status
    const toggleSubCategoryActive = async (subCategoryId: number) => {
        if (!categoryId) return;

        try {
            await putAdminWithAuth(
                `${ENDPOINTS.ADMIN.CATEGORIES}/${categoryId}/sub-categories/${subCategoryId}/toggle-status`,
                {}
            );
            setSubCategories(subCategories.map((subCategory) =>
                subCategory.id === subCategoryId ? { ...subCategory, isActive: !subCategory.isActive } : subCategory
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái thể loại con');
        }
    };

    // Open edit modal
    const openEditModal = (subCategory: SubCategoryData) => {
        setSelectedSubCategory(subCategory);
        setEditName(subCategory.name);
        setEditActive(subCategory.isActive);
        setEditModalOpen(true);
        setCreateError(null);
        setCreateSuccess(null);
    };

    // Close edit modal
    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedSubCategory(null);
        setEditName('');
        setEditActive(true);
        setCreateError(null);
        setCreateSuccess(null);
    };

    // Update subcategory
    const updateSubCategory = async () => {
        if (!categoryId || !selectedSubCategory) return;

        setCreateError(null);
        setCreateSuccess(null);

        if (!editName.trim()) {
            setCreateError('Tên thể loại con không được để trống');
            return;
        }

        try {
            const updatedSubCategory = {
                id: selectedSubCategory.id,
                name: editName.trim(),
                isActive: editActive,
                categoryId: parseInt(categoryId.toString()),
                orderIndex: selectedSubCategory.orderIndex
            };

            await putAdminWithAuth<{subCategory: SubCategoryData}>(
                `${ENDPOINTS.ADMIN.CATEGORIES}/${categoryId}/sub-categories/${selectedSubCategory.id}`,
                updatedSubCategory
            );

            setSubCategories(subCategories.map((sc) =>
                sc.id === selectedSubCategory.id
                    ? { ...sc, name: editName.trim(), isActive: editActive }
                    : sc
            ));

            setOriginalSubCategories(
                originalSubCategories.map((sc) =>
                    sc.id === selectedSubCategory.id
                        ? { ...sc, name: editName.trim(), isActive: editActive }
                        : sc
                )
            );

            setCreateSuccess('Cập nhật thể loại con thành công');
            setTimeout(() => {
                setEditModalOpen(false);
                setCreateSuccess(null);
            }, 1500);
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Không thể cập nhật thể loại con');
        }
    };

    // Open create modal
    const openCreateModal = () => {
        setCreateModalOpen(true);
        setNewSubCategoryName('');
        setNewSubCategoryActive(true);
        setCreateError(null);
        setCreateSuccess(null);
    };

    // Close create modal
    const closeCreateModal = () => {
        setCreateModalOpen(false);
        setNewSubCategoryName('');
        setNewSubCategoryActive(true);
        setCreateError(null);
        setCreateSuccess(null);
    };

    // Create new subcategory
    const createNewSubCategory = async () => {
        if (!categoryId) return;

        setCreateError(null);
        setCreateSuccess(null);

        if (!newSubCategoryName.trim()) {
            setCreateError('Tên thể loại con không được để trống');
            return;
        }

        try {
            // Automatically set the order at the end of the list
            const maxOrderIndex = subCategories.length > 0
                ? Math.max(...subCategories.map(sc => sc.orderIndex))
                : 0;

            const newSubCategory = {
                name: newSubCategoryName.trim(),
                isActive: newSubCategoryActive,
                categoryId: parseInt(categoryId.toString()),
                orderIndex: maxOrderIndex + 1, // Always add at the end
            };

            const response = await requestPostAdminWithAuth<{subCategory: SubCategoryData}>(
                `${ENDPOINTS.ADMIN.CATEGORIES}/${categoryId}/sub-categories`,
                newSubCategory
            );

            if (response && response.subCategory) {
                setSubCategories([...subCategories, response.subCategory]);
                setOriginalSubCategories([...subCategories, response.subCategory]);
                setTotalElements(totalElements + 1);
                setCreateSuccess('Tạo thể loại con thành công');
                setNewSubCategoryName('');
                setNewSubCategoryActive(true);
                setTimeout(() => setCreateModalOpen(false), 1500);
            }
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Không thể tạo thể loại con mới');
        }
    };

    // Navigate back to category management
    const goBackToCategories = () => {
        navigate('/admin/categories');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <button
                                onClick={goBackToCategories}
                                className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Quay lại danh sách thể loại
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {loading ? 'Đang tải...' : (category ? `Thể loại con của: ${category.name}` : 'Thể loại không tồn tại')}
                            </h1>
                            <p className="text-gray-500 mt-1">Tổng số: {totalElements} thể loại con</p>
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
                                        Thêm thể loại con
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
                            Chế độ thay đổi thứ tự đang được kích hoạt. Kéo và thả các thể loại con để thay đổi vị trí, sau đó nhấn "Lưu thứ tự" để lưu lại thay đổi.
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên thể loại con..."
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
                        <Droppable droppableId="subCategories" isDropDisabled={!isDragModeEnabled}>
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
                                            <th className="px-6 py-3 text-gray-600">Tên thể loại con</th>
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
                                        ) : subCategories.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                    Không tìm thấy thể loại con nào
                                                </td>
                                            </tr>
                                        ) : (
                                            subCategories.map((subCategory, index) => (
                                                <Draggable
                                                    key={subCategory.id}
                                                    draggableId={subCategory.id.toString()}
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
                                                            <td className="px-6 py-4 font-medium">{subCategory.id}</td>
                                                            <td className="px-6 py-4">{subCategory.name}</td>
                                                            <td className="px-6 py-4">{subCategory.orderIndex}</td>
                                                            <td className="px-6 py-4">{formatDate(subCategory.createdAt)}</td>
                                                            <td className="px-6 py-4">{formatDate(subCategory.updatedAt)}</td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                                                                        subCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                    }`}
                                                                >
                                                                    {subCategory.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-2">
                                                                    {!isDragModeEnabled ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => openEditModal(subCategory)}
                                                                                className="px-3 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                                Chỉnh sửa
                                                                            </button>
                                                                            <button
                                                                                onClick={() => toggleSubCategoryActive(subCategory.id)}
                                                                                className={`px-3 py-1 rounded-lg border transition-colors ${
                                                                                    subCategory.isActive
                                                                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                                                                }`}
                                                                            >
                                                                                {subCategory.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
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

            {/* Edit Modal */}
            {editModalOpen && selectedSubCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa thể loại con</h2>
                            <button
                                onClick={closeEditModal}
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
                                    <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên thể loại con <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="subCategoryName"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Nhập tên thể loại con"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={editActive}
                                        onChange={(e) => setEditActive(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                        Kích hoạt
                                    </label>
                                </div>
                                <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600">
                                        <span className="font-medium">Lưu ý:</span> Bạn đang chỉnh sửa thể loại con có ID: {selectedSubCategory.id}.
                                        Để thay đổi thứ tự hiển thị, hãy sử dụng chức năng "Thay đổi thứ tự" ở trang chính.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={closeEditModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={updateSubCategory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Tạo thể loại con mới</h2>
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
                                    <label htmlFor="newSubCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên thể loại con <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="newSubCategoryName"
                                        value={newSubCategoryName}
                                        onChange={(e) => setNewSubCategoryName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Nhập tên thể loại con"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="newIsActive"
                                        checked={newSubCategoryActive}
                                        onChange={(e) => setNewSubCategoryActive(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="newIsActive" className="ml-2 block text-sm text-gray-700">
                                        Kích hoạt
                                    </label>
                                </div>
                                <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600">
                                        <span className="font-medium">Lưu ý:</span> Thể loại con mới sẽ được thêm vào cuối danh sách.
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
                                onClick={createNewSubCategory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Tạo thể loại con
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubCategoryManagement;