import React from "react";
import {Instructor} from "../../../types/course";

interface InstructorInfoProps {
    instructor: Instructor;
}

export const InstructorInfo: React.FC<InstructorInfoProps> = ({ instructor }) => {
    return (
        <div className="flex items-center space-x-4 mb-6">
            <img
                src={instructor.avatarUrl}
                alt={instructor.fullName}
                className="w-12 h-12 rounded-full border-2 border-blue-600"
            />
            <div>
                <div className="font-medium text-white">{instructor.fullName}</div>
                <div className="text-sm text-gray-300">{instructor.title}</div>
            </div>
        </div>
    );
};