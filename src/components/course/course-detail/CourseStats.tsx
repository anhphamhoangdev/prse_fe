import React from "react";
import {Clock, Globe, Star, Users} from "lucide-react";
import {CourseData} from "../../../types/course";

interface CourseStatsProps {
    courseData: CourseData;
}

export const CourseStats: React.FC<CourseStatsProps> = ({ courseData }) => {
    return (
        <div className="flex items-center space-x-6 text-sm mb-8">
            <div className="flex items-center text-gray-300">
                <Users className="w-4 h-4 mr-2" />
                {courseData.totalStudents.toLocaleString()} students
            </div>
            <div className="flex items-center text-gray-300">
                <Clock className="w-4 h-4 mr-2" />
                {courseData.totalDuration}
            </div>
            <div className="flex items-center text-gray-300">
                <Globe className="w-4 h-4 mr-2" />
                {courseData.language}
            </div>
            <div className="flex items-center text-gray-300">
                <Star className="w-4 h-4 mr-2 text-yellow-400" />
                {courseData.rating}
            </div>
        </div>
    );
};