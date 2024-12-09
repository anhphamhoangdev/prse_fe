// Tạo component riêng cho Rating Statistics
import {Star} from "lucide-react";
import {FeedbackData} from "../../../types/course";

export const RatingStatistics = ({ isLoading, allFeedbacks }: { isLoading: boolean; allFeedbacks: FeedbackData[] }) => {
    if (isLoading) {
        return (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="h-10 bg-gray-200 rounded-full w-20 mx-auto mb-2" />
                        <div className="flex justify-center gap-1 my-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-5 h-5 bg-gray-200 rounded-full" />
                            ))}
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
                    </div>
                    <div className="col-span-2 space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-2 bg-gray-200 rounded w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const averageRating = allFeedbacks.length > 0
        ? Number((allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length).toFixed(1))
        : 0;

    return (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 transition-transform duration-300 transform hover:scale-105">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
                    <div className="flex justify-center my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className="w-5 h-5 transition-transform duration-200"
                                fill={star <= averageRating ? "#FFD700" : "none"}
                                color={star <= averageRating ? "#FFD700" : "#D1D5DB"}
                            />
                        ))}
                    </div>
                    <div className="text-sm text-gray-500">{allFeedbacks.length} đánh giá</div>
                </div>
                <div className="col-span-2">
                    {[5, 4, 3, 2, 1].map((num) => {
                        const ratingsInRange = allFeedbacks.filter(f =>
                            f.rating > (num - 1) && f.rating <= num
                        ).length;

                        const percentage = allFeedbacks.length > 0
                            ? (ratingsInRange / allFeedbacks.length) * 100
                            : 0;

                        return (
                            <div key={num} className="flex items-center gap-2 mb-2">
                                <div className="text-sm font-medium w-3">{num}</div>
                                <Star
                                    className="w-4 h-4 transition-transform duration-200"
                                    fill="#FFD700"
                                    color="#FFD700"
                                />
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                                        style={{width: `${percentage}%`}}
                                    />
                                </div>
                                <div className="text-sm text-gray-500 w-10">
                                    {ratingsInRange}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
