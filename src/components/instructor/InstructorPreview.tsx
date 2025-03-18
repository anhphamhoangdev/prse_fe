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
        <div className="border border-gray-200 rounded-md p-2 bg-white shadow-sm">
            <div className="flex items-center p-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-blue-600" />
                </div>

                <div>
                    <div className="font-semibold text-sm text-gray-800">
                        {displayName || 'Tên hiển thị'}
                    </div>
                    <div className="text-xs text-gray-600">
                        {titles.length > 0
                            ? titles.slice(0, 2).join(' • ')
                            : 'Chức danh chuyên môn'}
                        {titles.length > 2 && ' ...'}
                    </div>
                </div>
            </div>

            {hasMultipleTitles && (
                <div className="mt-1 text-xs text-amber-600 bg-amber-50 p-1.5 rounded">
                    <strong>Lưu ý:</strong> Bạn đã nhập {titles.length} chức danh. Chúng tôi khuyến nghị chỉ nên để 1-2 chức danh để tối ưu hiển thị và tăng tính chuyên nghiệp.
                </div>
            )}

            <div className="mt-1 text-xs text-gray-500 italic p-1.5">
                Bạn sẽ được chỉnh sửa avatar sau khi thanh toán thành công
            </div>
        </div>
    );
};

export default InstructorPreview;