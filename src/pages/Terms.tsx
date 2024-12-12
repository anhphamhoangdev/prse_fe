import React, {useState} from "react";
import {ChevronRight, FileText} from "lucide-react";
import {BackButton} from "../components/common/BackButton";


export const Terms: React.FC = () => {
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const sections = [
        {
            title: "Điều khoản sử dụng cơ bản",
            content: "Bằng việc truy cập và sử dụng website này, bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện của chúng tôi. Nếu bạn không đồng ý với bất kỳ phần nào trong điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi. Bạn cũng cam kết sử dụng website một cách hợp pháp, không xâm phạm quyền lợi của các bên khác và không thực hiện các hành vi gây tổn hại đến hệ thống hoặc nội dung của website."
        },
        {
            title: "Quyền sở hữu trí tuệ",
            content: "Tất cả nội dung khóa học, tài liệu, video, hình ảnh, văn bản và các tài nguyên khác được cung cấp trên website đều được bảo vệ bởi luật bản quyền và các quyền sở hữu trí tuệ khác. Bạn không được sao chép, tái sản xuất, chỉnh sửa, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự cho phép bằng văn bản từ chúng tôi. Việc vi phạm có thể dẫn đến các hậu quả pháp lý nghiêm trọng."
        },
        {
            title: "Quy định sử dụng tài khoản",
            content: "Mỗi học viên chỉ được phép sử dụng một tài khoản duy nhất trên website. Nghiêm cấm việc chia sẻ tài khoản hoặc thông tin đăng nhập với người khác. Bạn có trách nhiệm bảo mật thông tin tài khoản của mình và thông báo ngay lập tức nếu phát hiện bất kỳ hành vi sử dụng trái phép nào. Chúng tôi có quyền khóa tài khoản của bạn nếu phát hiện vi phạm quy định này."
        },
        {
            title: "Điều khoản thanh toán và hoàn tiền",
            content: "Tất cả các giao dịch thanh toán trên website đều được xử lý thông qua các cổng thanh toán an toàn. Các khoản thanh toán sẽ không được hoàn lại trừ khi có sự cố kỹ thuật từ phía chúng tôi hoặc trường hợp đặc biệt theo quy định của chính sách hoàn tiền. Vui lòng đọc kỹ thông tin trước khi mua khóa học để tránh nhầm lẫn."
        },
        {
            title: "Điều khoản cập nhật",
            content: "Chúng tôi có quyền cập nhật, chỉnh sửa hoặc thay đổi các điều khoản và điều kiện bất cứ lúc nào mà không cần thông báo trước. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website. Bạn có trách nhiệm kiểm tra thường xuyên để nắm rõ các điều khoản mới nhất."
        },
        {
            title: "Trách nhiệm và giới hạn pháp lý",
            content: "Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại hoặc mất mát nào phát sinh từ việc sử dụng dịch vụ của chúng tôi, bao gồm nhưng không giới hạn ở lỗi kỹ thuật, nội dung không chính xác, hoặc các vấn đề khác không nằm trong tầm kiểm soát của chúng tôi. Trách nhiệm của chúng tôi chỉ giới hạn ở mức giá trị dịch vụ mà bạn đã thanh toán."
        },
        {
            title: "Chính sách bảo mật",
            content: "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Mọi thông tin thu thập sẽ được sử dụng theo chính sách bảo mật của chúng tôi, đảm bảo không chia sẻ cho bên thứ ba mà không có sự đồng ý của bạn, ngoại trừ trường hợp được yêu cầu bởi pháp luật."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center mb-12">
                    <div className="w-full flex justify-start mb-6">
                        <BackButton/>
                    </div>
                    <span className="text-3xl sm:text-4xl font-bold">
                        <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Easy</span>
                        <span className="bg-gradient-to-r from-slate-600 to-slate-900 bg-clip-text text-transparent">Edu</span>
                    </span>
                </div>

                <div className="text-center mb-12">
                    <div className="inline-block p-2 bg-blue-100 rounded-lg mb-4">
                        <FileText className="w-8 h-8 text-blue-600"/>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        Điều khoản sử dụng
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Vui lòng đọc kỹ các điều khoản sau đây trước khi sử dụng dịch vụ của chúng tôi
                    </p>
                </div>

                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                            <button
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-blue-50 transition-colors duration-200"
                                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                            >
                                <span className="font-semibold text-gray-800 flex items-center">
                                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full mr-3 text-sm text-blue-600">
                                        {index + 1}
                                    </span>
                                    {section.title}
                                </span>
                                <ChevronRight
                                    className={`w-5 h-5 text-blue-500 transition-transform duration-200 ${
                                        expandedSection === index ? 'transform rotate-90' : ''
                                    }`}
                                />
                            </button>
                            <div
                                className={`px-6 transition-all duration-200 ease-in-out ${
                                    expandedSection === index ? 'py-4 opacity-100' : 'h-0 py-0 opacity-0 overflow-hidden'
                                }`}
                            >
                                <p className="text-gray-600 leading-relaxed pl-11">{section.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};