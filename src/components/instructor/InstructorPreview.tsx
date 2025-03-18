import React from 'react';
import { User } from 'lucide-react';

interface InstructorPreviewProps {
    displayName: string;
    title: string;
}

const InstructorPreview: React.FC<InstructorPreviewProps> = ({ displayName, title }) => {
    // Xử lý hiển thị chức danh
    const titles = title.split(',').map(t => t.trim()).filter(t => t !== '');
    const hasMultipleTitles = titles.length > 2;

    return (
        <div className="border border-gray-200 rounded-lg p-4 mt-4 bg-white shadow-sm">
            <h3 className="font-medium text-gray-700 mb-2">Ví dụ hiển thị</h3>

            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-6 h-6 text-blue-600" />
                </div>

                <div>
                    <div className="font-semibold text-gray-800">
                        {displayName || 'Tên hiển thị'}
                    </div>
                    <div className="text-sm text-gray-600">
                        {titles.length > 0
                            ? titles.slice(0, 2).join(' • ')
                            : 'Chức danh chuyên môn'}
                        {titles.length > 2 && ' ...'}
                    </div>
                </div>
            </div>

            {hasMultipleTitles && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <strong>Lưu ý:</strong> Bạn đã nhập {titles.length} chức danh. Chúng tôi khuyến nghị chỉ nên để 1-2 chức danh để tối ưu hiển thị và tăng tính chuyên nghiệp.
                </div>
            )}
        </div>
    );
};

export default InstructorPreview;