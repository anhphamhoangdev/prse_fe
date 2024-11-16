import React from "react";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => (
    <footer className="bg-slate-900 text-gray-300 py-8 mt-8 w-full border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Thông tin công ty */}
                <div className="space-y-3">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-sky-300 mb-2
                                 hover:from-blue-300 hover:to-sky-200 transition-all duration-300 cursor-default">
                        EasyEdu.vn
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-xs hover:text-slate-200 transition-colors duration-300">
                        Nền tảng học tập trực tuyến hàng đầu Việt Nam.
                    </p>
                </div>

                {/* Liên hệ */}
                <div className="space-y-3">
                    <h4 className="text-base font-medium text-slate-200 mb-2">Liên Hệ</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="p-1.5 rounded-md bg-slate-800/80 group-hover:bg-blue-500/10 transition-colors duration-300">
                                <MapPin className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                            </div>
                            <p className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors duration-300">
                                Số 1, Võ Văn Ngân, Thủ Đức, TP.HCM
                            </p>
                        </div>
                        <a href="mailto:anhphamhoang033@gmail.com" className="flex items-center gap-2 group">
                            <div className="p-1.5 rounded-md bg-slate-800/80 group-hover:bg-blue-500/10 transition-colors duration-300">
                                <Mail className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                            </div>
                            <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors duration-300">
                                anhphamhoang033@gmail.com
                            </span>
                        </a>
                        <a href="tel:0914311299" className="flex items-center gap-2 group">
                            <div className="p-1.5 rounded-md bg-slate-800/80 group-hover:bg-blue-500/10 transition-colors duration-300">
                                <Phone className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                            </div>
                            <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors duration-300">
                                0914 311 299
                            </span>
                        </a>
                    </div>
                </div>

                {/* Mạng xã hội */}
                <div className="space-y-3">
                    <h4 className="text-base font-medium text-slate-200 mb-2">Kết Nối</h4>
                    <div className="flex gap-3">
                        <a href="#"
                           className="p-2 rounded-lg bg-slate-800/80 transition-all duration-300
                                    hover:bg-blue-500/10 hover:scale-110 group hover:shadow-lg">
                            <Facebook className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        </a>
                        <a href="#"
                           className="p-2 rounded-lg bg-slate-800/80 transition-all duration-300
                                    hover:bg-blue-500/10 hover:scale-110 group hover:shadow-lg">
                            <Instagram className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        </a>
                        <a href="#"
                           className="p-2 rounded-lg bg-slate-800/80 transition-all duration-300
                                    hover:bg-blue-500/10 hover:scale-110 group hover:shadow-lg">
                            <Youtube className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="pt-6 mt-6 border-t border-slate-800/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
                    <p>&copy; {new Date().getFullYear()} EasyEdu.vn. Tất cả quyền được bảo lưu.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-blue-300 transition-colors duration-300">Điều khoản</a>
                        <a href="#" className="hover:text-blue-300 transition-colors duration-300">Chính sách</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
);