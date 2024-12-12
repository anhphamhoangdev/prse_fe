import { useNavigate } from 'react-router-dom';
import {ChevronLeft} from "lucide-react";
import React from "react";

export const BackButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 mb-8 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
            <ChevronLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Quay lại</span>
        </button>
    );
};