import { useNavigate } from 'react-router-dom';

export function BackButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2
                     text-gray-600 bg-white rounded-lg
                     hover:bg-gray-50 hover:text-gray-800
                     active:bg-gray-100
                     shadow-sm hover:shadow
                     transition-all duration-300 ease-in-out
                     group" // Thêm group để làm animation cho icon
        >
            <svg
                className="w-5 h-5 transform group-hover:-translate-x-1
                         transition-transform duration-300 ease-in-out"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            <span className="font-medium">Quay lại</span>
        </button>
    );
}