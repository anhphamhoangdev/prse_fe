import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, ArrowLeft, Trophy, Mail, Facebook } from 'lucide-react';
import { requestPostWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import { formatLocalDateTimeToVN } from "../../utils/formatLocalDateTimeToVN";
import { Footer } from "../../components/common/Footer";
import { Helmet, HelmetProvider } from 'react-helmet-async'; // Thay đổi import để sử dụng react-helmet-async

interface Certificate {
    id: number;
    studentId: number;
    nameInCertificate: string;
    courseId: number;
    courseName: string;
    certificateUrl: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
}

interface ApiData {
    certificate: Certificate;
}

const CertificatePage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                setLoading(true);
                const response: ApiData = await requestPostWithAuth(
                    ENDPOINTS.CERTIFICATE.GENERATE_CERTIFICATE,
                    { courseId: parseInt(courseId || '0') }
                );
                setCertificate(response.certificate);
            } catch (err) {
                setError('Đã xảy ra lỗi khi tải chứng chỉ. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchCertificate();
    }, [courseId]);

    const handleDownload = async () => {
        if (!certificate?.certificateUrl) {
            alert('Không tìm thấy URL chứng chỉ. Vui lòng thử lại.');
            return;
        }

        try {
            const response = await fetch(certificate.certificateUrl, {
                credentials: 'omit', // Không gửi credentials
            });
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `certificate_${certificate.courseId}.png`;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('Lỗi khi tải chứng chỉ:', error);
            alert('Không thể tải chứng chỉ. Vui lòng kiểm tra kết nối hoặc thử lại.');
        }
    };

    const handleShareLinkedIn = () => {
        if (!certificate) return;

        const shareUrl = encodeURIComponent(`https://prse-fe.vercel.app/course-detail/${courseId}`);
        const caption = encodeURIComponent(
            `Tôi vừa hoàn thành khóa học "${certificate.courseName}" trên EasyEdu và nhận được chứng chỉ! 🎉 #HọcTập #ThànhTựu`
        );
        const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${caption}`;
        window.open(linkedInShareUrl, '_blank');
    };

    const handleBackToCourse = () => {
        navigate(`/course-detail/${courseId}`);
    };

    const formattedDate = certificate?.createdAt
        ? formatLocalDateTimeToVN(certificate.createdAt)
        : '';

    // Chuẩn bị metadata trước khi render
    const pageTitle = `EasyEdu - Chứng Chỉ ${certificate?.courseName || 'Học Trực Tuyến'}`;
    const pageDescription = `Chứng chỉ hoàn thành khóa học ${certificate?.courseName || ''} từ EasyEdu. Uy tín, chuyên nghiệp, hỗ trợ sự nghiệp của bạn!`;
    const pageImage = certificate?.certificateUrl || 'https://scontent-ord5-3.xx.fbcdn.net/...';

    return (
        <HelmetProvider>
            <div className="certificate-page min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
                <Helmet>
                    <title>{pageTitle}</title>
                    <meta name="description" content={pageDescription} />
                    <meta property="og:title" content={pageTitle} />
                    <meta property="og:description" content={pageDescription} />
                    <meta property="og:image" content={pageImage} />
                    {/* Thêm các thẻ meta khác nếu cần */}
                    <meta property="og:type" content="website" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={pageTitle} />
                    <meta name="twitter:description" content={pageDescription} />
                    <meta name="twitter:image" content={pageImage} />
                </Helmet>

                {/* Back button bar */}
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <button
                        onClick={handleBackToCourse}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại khóa học
                    </button>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <span className="text-blue-600 font-semibold">Chứng Chỉ Hoàn Thành</span>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center shadow-md">
                            {error}
                        </div>
                    )}

                    {certificate && certificate.active && (
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                            <div className="flex flex-col lg:flex-row">
                                {/* Left section - 80% */}
                                <div className="lg:w-4/5 p-6 sm:p-10">
                                    {/* Certificate Info */}
                                    <div className="text-center mb-8">
                                        <div className="mt-4 inline-block px-6 py-2 bg-blue-50 rounded-full text-blue-600 text-sm">
                                            Ngày cấp: {formattedDate}
                                        </div>
                                    </div>

                                    {/* Certificate Image */}
                                    <div className="mt-8 relative">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent rounded-xl -m-4 blur-lg opacity-50"></div>
                                        <img
                                            src={certificate.certificateUrl}
                                            alt={`Chứng chỉ ${certificate.courseName}`}
                                            className="w-full max-w-3xl mx-auto rounded-lg shadow-lg border-4 border-white relative z-10"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://scontent-ord5-3.xx.fbcdn.net/...';
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Right section - 20% */}
                                <div className="lg:w-1/5 bg-gradient-to-b from-blue-50 to-blue-100 p-6 flex flex-col gap-5 justify-start">
                                    <div className="text-center mb-6">
                                        <h3 className="text-blue-700 font-bold text-xl">Tuỳ Chọn</h3>
                                        <div className="w-16 h-1 bg-blue-600 mx-auto mt-2"></div>
                                    </div>

                                    {/* Actions - Stacked vertically */}
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full shadow-md"
                                    >
                                        <Download className="w-5 h-5" />
                                        <span className="font-medium">Tải chứng chỉ</span>
                                    </button>

                                    <button
                                        onClick={handleShareLinkedIn}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors w-full shadow-sm"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span className="font-medium">Chia sẻ LinkedIn</span>
                                    </button>

                                    <button
                                        onClick={() => {}}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors w-full shadow-sm"
                                    >
                                        <Mail className="w-5 h-5" />
                                        <span>Gửi qua Email</span>
                                    </button>

                                    <button
                                        onClick={() => {}}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors w-full shadow-sm"
                                    >
                                        <Facebook className="w-5 h-5" />
                                        <span>Chia sẻ Facebook</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {certificate && !certificate.active && (
                        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg text-center shadow-md border border-yellow-200">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
                                    <span className="text-2xl font-bold">!</span>
                                </div>
                                <h3 className="text-xl font-bold">Chứng chỉ không hợp lệ</h3>
                                <p>Chứng chỉ này không còn hiệu lực. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.</p>
                                <button
                                    onClick={handleBackToCourse}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Quay lại khóa học
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <Footer/>
            </div>
        </HelmetProvider>
    );
};

export default CertificatePage;