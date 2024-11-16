import React, { useState } from 'react';
import { Star } from "lucide-react";
import type { FeedbackData } from '../../../types/course';

interface CourseFeedbackProps {
    feedbacks: FeedbackData[];
    isEnrolled: boolean;
    hasMoreFeedbacks: boolean;
    isLoadingMore?: boolean;
    onLoadMoreFeedbacks: () => void;
    onSubmitFeedback: (rating: number, comment: string) => void;
}

export const CourseFeedback: React.FC<CourseFeedbackProps> = ({
                                                                  feedbacks,
                                                                  isEnrolled,
                                                                  hasMoreFeedbacks,
                                                                  isLoadingMore = false,
                                                                  onLoadMoreFeedbacks,
                                                                  onSubmitFeedback
                                                              }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmitFeedback(rating, comment);
            setRating(5);
            setComment('');
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Đánh giá từ học viên</h2>

            {/* Feedback Form for enrolled students */}
            {isEnrolled && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-900">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(null)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className="w-6 h-6"
                                        fill={(hoveredStar || rating) >= star ? "#FFD700" : "none"}
                                        color={(hoveredStar || rating) >= star ? "#FFD700" : "#D1D5DB"}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-900">Your Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this course..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!comment.trim() || isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            )}

            {/* Feedback List */}
            <div className="space-y-6">
                {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                <img
                                    src={feedback.studentAvatarUrl}
                                    alt={feedback.studentName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900">{feedback.studentName}</h4>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, index) => (
                                            <Star
                                                key={index}
                                                className="w-4 h-4"
                                                fill={index < feedback.rating ? "#FFD700" : "none"}
                                                color={index < feedback.rating ? "#FFD700" : "#D1D5DB"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {new Date(feedback.createdAt).toLocaleString("vi-VN", {
                                        timeZone: "UTC",
                                        hour12: false
                                    })}
                                </p>
                                <p className="mt-2 text-gray-700">{feedback.comment}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Load More Button */}
                {hasMoreFeedbacks && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={onLoadMoreFeedbacks}
                            disabled={isLoadingMore}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoadingMore ? 'Loading...' : 'Load More Reviews'}
                        </button>
                    </div>
                )}
            </div>

            {/* No Feedbacks State */}
            {feedbacks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to review this course!
                </div>
            )}
        </div>
    );
};