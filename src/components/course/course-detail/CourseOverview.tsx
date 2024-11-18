import { CourseFeedback } from "./CourseFeedback";
import {CourseBasicDTO, FeedbackData} from "../../../types/course";
import React from "react";

interface CourseOverviewProps {
    courseData: CourseBasicDTO;
    feedbacks: FeedbackData[];
    hasMoreFeedbacks: boolean;
    isLoadingMore?: boolean;
    onLoadMoreFeedbacks: () => void;
    onSubmitFeedback: (rating: number, comment: string) => void;
    isLoadingFeedback: boolean;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({
                                                                  courseData,
                                                                  feedbacks,
                                                                  hasMoreFeedbacks,
                                                                  isLoadingMore = false,
                                                                  onLoadMoreFeedbacks,
                                                                  onSubmitFeedback,
                                                                  isLoadingFeedback = false
                                                              }) => (
    <div className="space-y-6">
        <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Bạn sẽ học được gì</h2>
            <div className="grid grid-cols-2 gap-4">
                {courseData.learningPoints.map(point => (
                    <div key={point.id} className="flex items-start space-x-2">
                        <div className="text-green-500">✓</div>
                        <p className="text-gray-700">{point.content}</p>
                    </div>
                ))}
            </div>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Yêu cầu đầu vào</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {courseData.prerequisites.map(prerequisite => (
                    <li key={prerequisite.id}>{prerequisite.content}</li>
                ))}
            </ul>
        </section>

        <section>
            <CourseFeedback
                feedbacks={feedbacks}
                isEnrolled={courseData.enrolled}
                hasMoreFeedbacks={hasMoreFeedbacks}
                isLoadingMore={isLoadingMore}
                onLoadMoreFeedbacks={onLoadMoreFeedbacks}
                onSubmitFeedback={onSubmitFeedback}
                isLoadingFeedback={isLoadingFeedback}
            />
        </section>
    </div>
);