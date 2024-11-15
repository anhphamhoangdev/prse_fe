import { CourseDetailData } from "../../../types/course";
import { CourseFeedback } from "./CourseFeedback";

interface CourseOverviewProps {
    courseData: CourseDetailData;
    onSubmitFeedback: (rating: number, comment: string) => void;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({
                                                                  courseData,
                                                                  onSubmitFeedback
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
                feedbacks={courseData.feedbacks}
                isEnrolled={courseData.isEnrolled}
                onSubmitFeedback={onSubmitFeedback}
            />
        </section>
    </div>
);