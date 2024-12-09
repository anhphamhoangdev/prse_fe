import {useEffect, useState} from "react";
import {Bot} from "lucide-react";

const LOADING_MESSAGES = [
    "Đang tìm kiếm những khóa học hoàn hảo dành riêng cho bạn...",
    "Chúng tôi đang lựa chọn những khóa học tuyệt vời nhất cho nhu cầu của bạn...",
    "Đang phân tích yêu cầu của bạn để tìm ra những điều tốt nhất...",
    "Hãy chờ một chút, những khóa học đỉnh cao đang trên đường đến với bạn!",
    "Đang tìm kiếm những gợi ý học tập thú vị nhất cho bạn...",
    "Chúng tôi đang khám phá các tùy chọn học tập đẳng cấp cho bạn!",
    "Hãy thư giãn, những nguồn học liệu chất lượng đang được kết nối...",
    "Một chút thời gian nữa thôi, những khóa học hấp dẫn đang sắp xuất hiện!",
    "Đang thu thập thông tin từ những khóa học mới nhất để phục vụ bạn...",
    "Những gợi ý tuyệt vời đang được chuẩn bị, hãy sẵn sàng nhé!",
    "Chúng tôi đang nấu nướng những ý tưởng học thú vị cho bạn!",
    "Hãy đợi một chút, những kho báu kiến thức đang được khai thác!",
    "Đang sắp xếp những điều thú vị mà bạn sẽ khám phá ngay!",
    "Chúng tôi đang thổi hồn vào những khóa học độc đáo chỉ dành cho bạn!",
    "Hãy cùng chờ xem, những điều bất ngờ đang chờ đón bạn phía trước!",
    "Chúng tôi đang lắng nghe trái tim của bạn để mang đến trải nghiệm học tập tuyệt vời nhất...",
    "Đang tìm kiếm những ngôi sao học tập sẽ tỏa sáng trong hành trình của bạn!",
    "Chúng tôi đang làm việc chăm chỉ để mang đến cho bạn những lựa chọn học tập tuyệt vời nhất!",
    "Đang kết nối những ý tưởng sáng tạo với mong muốn của bạn...",
    "Hãy chuẩn bị cho một hành trình học tập đầy thú vị và bất ngờ!",
    "Chúng tôi đang chăm sóc từng chi tiết để mang đến cho bạn trải nghiệm hoàn hảo!",
    "Đang mở ra cánh cửa dẫn đến những kiến thức mới mẻ và hấp dẫn cho bạn!"
];


export const LoadingMessage = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [fadeState, setFadeState] = useState(true);

    const getStatusInfo = (progress: number) => {
        if (progress < 25) {
            return {
                text: "Tiếp nhận yêu cầu",
                bgColor: "bg-yellow-100",
                textColor: "text-yellow-600"
            };
        } else if (progress < 50) {
            return {
                text: "Đang xử lý yêu cầu",
                bgColor: "bg-blue-100",
                textColor: "text-blue-600"
            };
        } else if (progress < 75) {
            return {
                text: "Phân tích kết quả",
                bgColor: "bg-indigo-100",
                textColor: "text-indigo-600"
            };
        } else {
            return {
                text: "Chuẩn bị phản hồi",
                bgColor: "bg-green-100",
                textColor: "text-green-600"
            };
        }
    };

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setFadeState(false);
            setTimeout(() => {
                setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
                setFadeState(true);
            }, 300);
        }, 4500);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev < 90) {
                    // Tăng nhanh hơn trong 30 giây đầu
                    return Math.min(prev + (90/30), 90);
                } else if (prev < 99) {
                    // Tăng chậm hơn từ 90% đến 99% trong 5 giây cuối
                    return Math.min(prev + (9/5), 99);
                }
                return prev;
            });
        }, 1000);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="flex justify-start">
            {/* Avatar container với animation pulse */}
            <div className="relative w-10 h-10 mr-3">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-20"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Message container với gradient border */}
            <div className="relative bg-white p-5 rounded-2xl rounded-bl-none shadow-lg max-w-md border border-transparent bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col gap-3">
                    {/* Loading message với animation */}
                    <p className={`text-slate-700 font-medium transition-opacity duration-300 ${fadeState ? 'opacity-100' : 'opacity-0'}`}>
                        {LOADING_MESSAGES[messageIndex]}
                    </p>

                    {/* Animated dots với gradient */}
                    <div className="flex gap-2">
                        <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce shadow-sm"></span>
                        <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce delay-75 shadow-sm"></span>
                        <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-bounce delay-150 shadow-sm"></span>
                    </div>

                    {/* Progress container */}
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div
                                className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getStatusInfo(progress).textColor} ${getStatusInfo(progress).bgColor} transition-all duration-300`}>
                                {getStatusInfo(progress).text}
                            </div>
                            <div className="text-right">
            <span
                className={`text-xs font-semibold inline-block ${getStatusInfo(progress).textColor} transition-colors duration-300`}>
                {Math.round(progress)}%
            </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                            <div
                                className={`bg-gradient-to-r ${progress < 25 ? 'from-yellow-400 to-yellow-600'
                                    : progress < 50 ? 'from-blue-400 to-blue-600'
                                        : progress < 75 ? 'from-indigo-400 to-indigo-600'
                                            : 'from-green-400 to-green-600'
                                } h-full rounded-full relative transition-all duration-500 shadow-lg`}
                                style={{
                                    width: `${progress}%`,
                                    boxShadow: `0 0 10px ${
                                        progress < 25 ? 'rgba(251, 191, 36, 0.5)'
                                            : progress < 50 ? 'rgba(59, 130, 246, 0.5)'
                                                : progress < 75 ? 'rgba(99, 102, 241, 0.5)'
                                                    : 'rgba(34, 197, 94, 0.5)'
                                    }`
                                }}
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};