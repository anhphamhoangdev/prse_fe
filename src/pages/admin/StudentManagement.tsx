import React, { useState, useEffect } from 'react';
import { Users, Check, X, Search, RefreshCw } from 'lucide-react';

interface StudentData {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    is_active: boolean;
    is_instructor: boolean;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

const mockStudents: StudentData[] = [
    {
        id: 1,
        full_name: "Nguyễn Văn A",
        email: "a.nguyen@example.com",
        phone_number: "0123456789",
        is_active: true,
        is_instructor: false,
    },
    {
        id: 2,
        full_name: "Trần Thị B",
        email: "b.tran@example.com",
        phone_number: "0987654321",
        is_active: true,
        is_instructor: true,
    },
    {
        id: 3,
        full_name: "Lê Văn C",
        email: "c.le@example.com",
        phone_number: "0112233445",
        is_active: false,
        is_instructor: false,
    },
    {
        id: 4,
        full_name: "Phạm Thị D",
        email: "d.pham@example.com",
        phone_number: "0667788990",
        is_active: true,
        is_instructor: true,
    },
    {
        id: 5,
        full_name: "Hoàng Văn E",
        email: "e.hoang@example.com",
        phone_number: "0543216789",
        is_active: true,
        is_instructor: false,
    },
];

const mockPageResponse: PageResponse<StudentData> = {
    content: mockStudents,
    totalPages: 1,
    totalElements: mockStudents.length,
    size: mockStudents.length,
    number: 0,
};

const StudentManagement = () => {
    // State management
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                // const queryParams = new URLSearchParams({
                //     page: currentPage.toString(),
                //     size: pageSize.toString(),
                //     search: searchTerm,
                //     status: statusFilter,
                //     role: roleFilter
                // });
                //
                // const response = await fetch(`/api/students?${queryParams}`);
                // if (!response.ok) throw new Error('Failed to fetch students');
                //
                // const data: PageResponse<StudentData> = await response.json();
                setStudents(mockStudents);
                setTotalPages(mockPageResponse.totalPages);
                setTotalElements(mockPageResponse.totalElements);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchStudents, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, pageSize, searchTerm, statusFilter, roleFilter]);

    const toggleStudentActive = async (studentId: number) => {
        try {
            const response = await fetch(`/api/students/${studentId}/toggle-status`, {
                method: 'PUT'
            });
            if (!response.ok) throw new Error('Failed to update student status');

            setStudents(students.map(student =>
                student.id === studentId ? { ...student, is_active: !student.is_active } : student
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update student status');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý học viên</h1>
                            <p className="text-gray-500 mt-1">Tổng số: {totalElements} học viên</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                            <span className="text-lg">+</span>
                            Thêm học viên
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email..."
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

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="INSTRUCTOR">Giảng viên</option>
                            <option value="STUDENT">Học viên</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 text-gray-600">ID</th>
                                <th className="px-6 py-3 text-gray-600">Họ và tên</th>
                                <th className="px-6 py-3 text-gray-600">Email</th>
                                <th className="px-6 py-3 text-gray-600">Số điện thoại</th>
                                <th className="px-6 py-3 text-gray-600">Trạng thái</th>
                                <th className="px-6 py-3 text-center text-gray-600">Giảng viên</th>
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
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Không tìm thấy học viên nào
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{student.id}</td>
                                        <td className="px-6 py-4">{student.full_name}</td>
                                        <td className="px-6 py-4">{student.email}</td>
                                        <td className="px-6 py-4">{student.phone_number}</td>
                                        <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    student.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {student.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {student.is_instructor ? (
                                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                                            ) : (
                                                <X className="w-5 h-5 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-1 hover:bg-gray-100 rounded-lg text-blue-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => toggleStudentActive(student.id)}
                                                    className={`px-3 py-1 rounded-lg border transition-colors ${
                                                        student.is_active
                                                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                            : 'border-green-200 text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {student.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Hiển thị {students.length} trên tổng số {totalElements} học viên
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(0);
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            >
                                <option value="10">10 / trang</option>
                                <option value="20">20 / trang</option>
                                <option value="50">50 / trang</option>
                            </select>

                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        className={`px-3 py-1 rounded-lg transition-colors ${
                                            currentPage === i
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;