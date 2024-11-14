import React, {useState} from "react";
import {InstructorInfo} from "./InstructorInfo";
import {CourseStats} from "./CourseStats";
import {EnrollButton} from "./EnrollButton";
import {Play} from "lucide-react";
import {VideoPlayer} from "../../common/VideoPlayer";
import {CourseDetailData} from "../../../types/course";

interface CourseHeroProps {
    courseData: CourseDetailData;
    onAddToCart?: () => void;
    onBuyNow?: () => void;
    onStartLearning?: () => void;
}

export const CourseHero: React.FC<CourseHeroProps> = ({
                                                          courseData,
                                                          onAddToCart,
                                                          onBuyNow,
                                                          onStartLearning
                                                      }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayVideo = () => {
        setIsPlaying(true);
    };

    const renderVideo = () => {
        if (!courseData.previewVideoUrl) return null;

        if (isPlaying) {
            return <VideoPlayer url={courseData.previewVideoUrl} />;
        }

        return (
            <div className="relative group cursor-pointer" onClick={handlePlayVideo}>
                <img
                    src={courseData.thumbnail}
                    alt="Course Preview"
                    className="rounded-lg shadow-lg border-2 border-gray-800 w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-600 group-hover:bg-blue-700 transition-colors">
                        <Play className="w-8 h-8 text-white" fill="white" />
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="backdrop-blur-md bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            {/*<Play className="w-5 h-5 text-white" />*/}
                            <div>
                                <div className="text-white font-medium">Preview this course</div>
                                <div className="text-gray-300 text-sm">Watch introduction video</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="text-blue-500 text-sm mb-2">Web Development</div>
                        <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
                        <p className="text-gray-300 mb-6">{courseData.description}</p>

                        <InstructorInfo instructor={courseData.instructor} />
                        <CourseStats courseData={courseData} />

                        <div className="flex items-center space-x-4">
                            <EnrollButton
                                isEnrolled={courseData.isEnrolled}
                                price={courseData.price}
                                onAddToCart={onAddToCart}
                                onBuyNow={onBuyNow}
                                onStartLearning={onStartLearning}
                            />
                            <p className="text-sm text-gray-400">Last updated: {courseData.lastUpdated}</p>
                        </div>
                    </div>
                    <div className="relative aspect-video">
                        {renderVideo()}
                    </div>
                </div>
            </div>
        </div>
    );
};