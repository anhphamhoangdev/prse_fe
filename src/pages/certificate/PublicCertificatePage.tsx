import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Share2, Trophy } from 'lucide-react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { request } from '../../utils/request'; // Giả sử đây là nơi bạn định nghĩa hàm request
import { Footer } from '../../components/common/Footer';
import {ENDPOINTS} from "../../constants/endpoint";

interface PublicCertificate {
    certificate: string; // URL của chứng chỉ
}

interface ApiResponse {
    error_message: Record<string, any>;
    code: number;
    data: PublicCertificate;
}

const PublicCertificatePage = () => {
    const { publiccode } = useParams<{ publiccode: string }>();
    const [certificate, setCertificate] = useState<PublicCertificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicCertificate = async () => {
            try {
                setLoading(true);
                const response = await request<ApiResponse>(
                    ENDPOINTS.CERTIFICATE.PULIC + `/${publiccode}`,
                );
                if (response.code === 1) {
                    setCertificate(response.data);
                } else {
                    throw new Error(
                        response.error_message?.message || 'Không tìm thấy chứng chỉ'
                    );
                }
            } catch (err) {
                setError('Không thể tải chứng chỉ. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchPublicCertificate();
    }, [publiccode]);

    const handleDownload = async () => {
        if (!certificate?.certificate) return;

        try {
            const response = await fetch(certificate.certificate, { credentials: 'omit' });
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `certificate_${publiccode}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            alert('Không thể tải chứng chỉ. Vui lòng thử lại.');
        }
    };

    const handleShareLinkedIn = () => {
        if (!certificate) return;

        const shareUrl = encodeURIComponent(window.location.href);
        const caption = encodeURIComponent(
            `Tôi vừa hoàn thành một khóa học trên EasyEdu và nhận được chứng chỉ! 🎉 #HọcTập #ThànhTựu`
        );
        const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${caption}`;
        window.open(linkedInShareUrl, '_blank');
    };

    const pageTitle = `EasyEdu - Chứng Chỉ Hoàn Thành`;
    const pageDescription = `Chứng chỉ hoàn thành khóa học từ EasyEdu. Uy tín, chuyên nghiệp, hỗ trợ sự nghiệp của bạn!`;
    const pageImage = certificate?.certificate || 'https://scontent-ord5-3.xx.fbcdn.net/...';

    return (
        <HelmetProvider>
            <div className="public-certificate-page min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
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

                {/* Main Content */}
                <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
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

                    {certificate && (
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                            <div className="text-center mb-6">
                                <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
                                <h1 className="text-2xl font-bold text-blue-700 mt-4">Chứng Chỉ Hoàn Thành</h1>
                            </div>

                            {/* Certificate Image */}
                            <img
                                src={certificate.certificate}
                                alt="Chứng chỉ EasyEdu"
                                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg border-4 border-white"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://scontent-ord5-3.xx.fbcdn.net/...';
                                }}
                            />

                            {/* Actions */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download className="w-5 h-5" />
                                    Tải chứng chỉ
                                </button>
                                <button
                                    onClick={handleShareLinkedIn}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Chia sẻ LinkedIn
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

export default PublicCertificatePage;