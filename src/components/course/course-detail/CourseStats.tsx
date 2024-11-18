import React from "react";
import {Clock, Eye, Globe, Star, Users} from "lucide-react";
import {CourseBasicDTO} from "../../../types/course";
import {AiFillStar} from "react-icons/ai";
import {formatDuration} from "../../../utils/formatSecondToHour";

interface CourseStatsProps {
    courseData: CourseBasicDTO;
}

export const CourseStats: React.FC<CourseStatsProps> = ({ courseData }) => {
    return (
        <div className="flex items-center space-x-6 text-sm mb-8">
            <div className="flex items-center text-gray-300">
                <Eye className="w-4 h-4 mr-2"/>
                {courseData.totalViews.toLocaleString()} lượt xem
            </div>
            {/*<div className="flex items-center text-gray-300">*/}
            {/*    <Clock className="w-4 h-4 mr-2" />*/}
            {/*    {formatDuration(courseData.totalDuration)}*/}
            {/*</div>*/}
            <div className="flex items-center text-gray-300">
                <Users className="w-4 h-4 mr-2"/>
                {courseData.totalStudents.toLocaleString()} học viên
            </div>
            <div className="flex items-center text-gray-300">
                <Globe className="w-4 h-4 mr-2"/>
                {courseData.language}
            </div>
            <div className="flex items-center text-gray-300">
                <AiFillStar className="w-4 h-4 mr-2 text-yellow-400"/>
                {courseData.averageRating.toFixed(1)}
            </div>
        </div>
    );
};
