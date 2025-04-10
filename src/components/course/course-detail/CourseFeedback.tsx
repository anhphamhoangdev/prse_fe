import React, {useEffect, useState} from 'react';
import { Star, ThumbsUp, Calendar, MessageCircle } from "lucide-react";
import type { FeedbackData } from '../../../types/course';
import {request, requestGetWithOptionalAuth, requestWithAuth} from "../../../utils/request";
import {RatingStatistics} from "./RatingStatistics";

interface CourseFeedbackProps {
    feedbacks: FeedbackData[];
    courseId: number;
    isEnrolled: boolean;
    hasMoreFeedbacks: boolean;
    isLoadingMore?: boolean;
    onLoadMoreFeedbacks: () => void;
    onSubmitFeedback: (rating: number, comment: string) => void;
    isLoadingFeedback?: boolean;
}

interface AllFeedbacksResponse {
    code: number;
    error_message: Record<string, any>;
    data: {
        feedbacks: FeedbackData[];
    };
}

export const CourseFeedback: React.FC<CourseFeedbackProps> = ({
                                                                  feedbacks,
                                                                  isEnrolled,
                                                                  hasMoreFeedbacks,
                                                                  isLoadingMore = false,
                                                                  onLoadMoreFeedbacks,
                                                                  onSubmitFeedback,
                                                                  isLoadingFeedback = false,
                                                                    courseId
                                                              }) => {

    // statistics
    const [allFeedbacks, setAllFeedbacks] = useState<FeedbackData[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        const loadAllFeedbacks = async () => {
            try {
                const response = await request<AllFeedbacksResponse>(`/course/${courseId}/all-feedbacks`);
                if(response.code === 1)
                {
                    setAllFeedbacks(response.data.feedbacks)
                }
            } catch (error) {
                console.error('Failed to load feedback statistics:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        loadAllFeedbacks();
    }, []);


    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const refreshAllFeedbacks = async () => {
        try {
            const response = await request<AllFeedbacksResponse>(`/course/${courseId}/all-feedbacks`);
            if(response.code === 1) {
                setAllFeedbacks(response.data.feedbacks)
            }
        } catch (error) {
            console.error('Failed to refresh feedback statistics:', error);
        }
    };

// Initial load
    useEffect(() => {
        refreshAllFeedbacks();
    }, [courseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmitFeedback(rating, comment);
            setRating(5);
            setComment('');
            // Gọi trực tiếp hàm refresh
            await refreshAllFeedbacks();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const getRatingLabel = (rating: number) => {
        switch(rating) {
            case 5: return 'Xuất sắc';
            case 4: return 'Rất tốt';
            case 3: return 'Tốt';
            case 2: return 'Trung bình';
            case 1: return 'Cần cải thiện';
            default: return '';
        }
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Đánh giá từ học viên</h2>
                {isEnrolled && (
                    <button
                        onClick={() => document.getElementById('feedback-form')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform-gpu"
                    >
                        <MessageCircle className="w-4 h-4 inline-block mr-2 transition-transform group-hover:rotate-12" />
                        Viết đánh giá
                    </button>
                )}
            </div>

            <RatingStatistics
                isLoading={isLoadingStats}
                allFeedbacks={allFeedbacks}
            />

            {/* Feedback Form */}
            {isEnrolled && (
                <form id="feedback-form" onSubmit={handleSubmit}
                      className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-transform duration-300 transform hover:shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Chia sẻ trải nghiệm của bạn</h3>
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(null)}
                                        className="focus:outline-none transition-transform hover:scale-125"
                                    >
                                        <Star
                                            className="w-8 h-8 transition-transform duration-200"
                                            fill={(hoveredStar || rating) >= star ? "#FFD700" : "none"}
                                            color={(hoveredStar || rating) >= star ? "#FFD700" : "#D1D5DB"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-gray-700 font-medium">
                            {getRatingLabel(hoveredStar || rating)}
                        </span>
                        </div>
                    </div>
                    <div className="mb-4">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ chi tiết trải nghiệm học tập của bạn..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                    />
                    </div>
                    <button
                        type="submit"
                        disabled={!comment.trim() || isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </form>
            )}

            {/* Feedback List */}
            <div className="space-y-4"> {/* Giảm khoảng cách giữa các bình luận */}
                {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-opacity duration-300 opacity-100"> {/* Giảm padding */}
                        <div className="flex items-start gap-4">
                            <img
                                src={feedback.studentAvatarUrl}
                                alt={feedback.studentName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                            />
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{feedback.studentName}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, index) => (
                                                    <Star
                                                        key={index}
                                                        className="w-4 h-4 transition-transform duration-200"
                                                        fill={index < feedback.rating ? "#FFD700" : "none"}
                                                        color={index < feedback.rating ? "#FFD700" : "#D1D5DB"}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                    {getRatingLabel(feedback.rating)}
                                </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 sm:mt-0">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(feedback.createdAt).toLocaleDateString("vi-VN", {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <p className="mt-3 text-gray-700 leading-relaxed">{feedback.comment}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Load More Button */}
            {hasMoreFeedbacks && feedbacks.length > 0 && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={onLoadMoreFeedbacks}
                        disabled={isLoadingMore}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-md text-base font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:shadow-lg"
                    >
                        {isLoadingMore ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>
                                Đang tải...
                            </>
                        ) : (
                            <>
                                Xem thêm đánh giá
                            </>
                        )}
                    </button>
                </div>
            )}


            {/* No Feedbacks State */}
            {feedbacks.length === 0 && !isLoadingFeedback && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
                </div>
            )}

            {/* Loading Skeleton */}
            {isLoadingFeedback && feedbacks.length === 0 && (
                <div className="space-y-6 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, index) => (
                                                    <div key={index} className="w-4 h-4 bg-gray-200 rounded" />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded w-24" />
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-full mt-4" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mt-2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};