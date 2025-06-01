import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div>
                        <div className="text-xl font-semibold text-gray-800">Đang tải bài học</div>
                        <div className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát...</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;