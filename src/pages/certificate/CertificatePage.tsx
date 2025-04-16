import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Download, ArrowLeft, Trophy, Copy, Share2} from 'lucide-react';
import { requestPostWithAuth } from "../../utils/request";
import { ENDPOINTS } from "../../constants/endpoint";
import { formatLocalDateTimeToVN } from "../../utils/formatLocalDateTimeToVN";
import { Footer } from "../../components/common/Footer";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {FaFacebook, FaFacebookMessenger, FaLinkedin, FaThreads, FaXTwitter} from "react-icons/fa6";

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
    certificatePublicCode?: string; // Added for public link (optional, adjust if stored differently)
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
    const [copied, setCopied] = useState(false); // State for copy confirmation

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
                credentials: 'omit',
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

    const handleCopyPublicLink = async () => {
        if (!certificate) return;

        try {
            // Use publicCode if available, otherwise fallback to courseId
            const publicCode = certificate.certificatePublicCode || 0;
            const publicLink = `${window.location.origin}/certificate/public/${publicCode}`;

            await navigator.clipboard.writeText(publicLink);
            setCopied(true);

            // Reset "Copied" state after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            alert('Không thể sao chép liên kết. Vui lòng thử lại.');
        }
    };

    const handleBackToCourse = () => {
        navigate(`/course-detail/${courseId}`);
    };

    const handleShare = (platform: string) => {
        if (!certificate) return;

        const publicLink = `https://prse-be.ddns.net/sharing/certificate/${certificate.certificatePublicCode}`;
        let shareUrl = '';

        switch (platform) {
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicLink)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`;
                break;
            case 'messenger':
                // For mobile devices
                if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    shareUrl = `fb-messenger://share/?link=${encodeURIComponent(publicLink)}`;
                } else {
                    // For desktop - opens Facebook Messenger web
                    shareUrl = `https://www.facebook.com/dialog/send?app_id=1437887850908369&link=${encodeURIComponent(publicLink)}&redirect_uri=${encodeURIComponent(window.location.href)}`;
                }
                break;
            case 'threads':
                shareUrl = `https://www.threads.net/intent/post?url=${encodeURIComponent(publicLink)}&text=Check out my certificate! %23achievement `;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicLink)}`;
                break;
            default:
                console.warn('Unsupported share platform');
                return;
        }

        window.open(shareUrl, '_blank');
    };


    const formattedDate = certificate?.createdAt
        ? formatLocalDateTimeToVN(certificate.createdAt)
        : '';

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
                    <meta property="og:type" content="website" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={pageTitle} />
                    <meta name="twitter:description" content={pageDescription} />
                    <meta name="twitter:image" content={pageImage} />
                </Helmet>

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
                                <div className="lg:w-4/5 p-6 sm:p-10">
                                    <div className="text-center mb-8">
                                        <div className="mt-4 inline-block px-6 py-2 bg-blue-50 rounded-full text-blue-600 text-sm">
                                            Ngày cấp: {formattedDate}
                                        </div>
                                    </div>

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

                                <div
                                    className="lg:w-1/5 bg-gradient-to-b from-blue-50 to-blue-100 p-6 flex flex-col gap-5 justify-start">
                                    <div className="text-center mb-6">
                                        <h3 className="text-blue-700 font-bold text-xl">Tuỳ Chọn</h3>
                                        <div className="w-16 h-1 bg-blue-600 mx-auto mt-2"></div>
                                    </div>

                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full shadow-md"
                                    >
                                        <Download className="w-5 h-5"/>
                                        <span className="font-medium">Tải chứng chỉ</span>
                                    </button>

                                    {/* Header cho phần chia sẻ */}
                                    <div className="text-center mb-4">
                                        <h3 className="text-blue-700 font-bold text-lg">Chia sẻ chứng chỉ</h3>
                                        <div className="w-16 h-1 bg-blue-600 mx-auto mt-2"></div>
                                    </div>

                                    {/* Grid layout cho các nút mạng xã hội */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {/* LinkedIn */}
                                        <button
                                            onClick={() => handleShare('linkedin')}
                                            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-sm border border-gray-200"
                                        >
                                            <FaLinkedin className="w-8 h-8 text-[#0077b5] mb-2" />
                                            <span className="text-xs font-medium text-gray-700">LinkedIn</span>
                                        </button>

                                        {/* Facebook */}
                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-sm border border-gray-200"
                                        >
                                            <FaFacebook className="w-8 h-8 text-[#1877f2] mb-2" />
                                            <span className="text-xs font-medium text-gray-700">Facebook</span>
                                        </button>

                                        {/* Messenger */}
                                        <button
                                            onClick={() => handleShare('messenger')}
                                            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-sm border border-gray-200"
                                        >
                                            <FaFacebookMessenger className="w-8 h-8 text-[#0084ff] mb-2" />
                                            <span className="text-xs font-medium text-gray-700">Messenger</span>
                                        </button>

                                        {/* Threads */}
                                        <button
                                            onClick={() => handleShare('threads')}
                                            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-sm border border-gray-200"
                                        >
                                            <FaThreads className="w-8 h-8 text-black mb-2" />
                                            <span className="text-xs font-medium text-gray-700">Threads</span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleCopyPublicLink}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors w-full shadow-sm"
                                    >
                                        <Copy className="w-5 h-5"/>
                                        <span className="font-medium">{copied ? 'Đã sao chép!' : 'Sao chép link'}</span>
                                    </button>

                                    {/* Twitter/X Share Button with React Icons */}
                                    {/*<button*/}
                                    {/*    onClick={() => handleShare('twitter')}*/}
                                    {/*    className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-50 transition-colors w-full shadow-sm"*/}
                                    {/*>*/}
                                    {/*    <FaXTwitter className="w-5 h-5" />*/}
                                    {/*    <span className="font-medium">Chia sẻ X/Twitter</span>*/}
                                    {/*</button>*/}
                                </div>
                            </div>
                        </div>
                    )}

                    {certificate && !certificate.active && (
                        <div
                            className="bg-yellow-50 text-yellow-700 p-6 rounded-lg text-center shadow-md border border-yellow-200">
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
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

                <Footer />
            </div>
        </HelmetProvider>
    );
};

export default CertificatePage;