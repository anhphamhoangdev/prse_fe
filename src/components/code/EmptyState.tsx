import React from 'react';
import { Code } from 'lucide-react';

const EmptyState: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <Code className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy bài học</h2>
                <p className="text-gray-500 max-w-md">
                    Vui lòng chọn một bài học khác để bắt đầu hành trình lập trình của bạn
                </p>
            </div>
        </div>
    );
};

export default EmptyState;