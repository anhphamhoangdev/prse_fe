import React from "react";

export const Footer = () => (
    <footer className="bg-gray-800 text-white py-8 mt-8 w-full">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-4">
                <div>
                    <h3 className="text-lg font-bold mb-2">TITV.vn</h3>
                    <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</p>
                    <p>Email: contact@titv.vn</p>
                    <p>Điện thoại: 0123 456 789</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2">Dịch vụ</h3>
                    <ul>
                        <li><a href="#" className="hover:underline">Dịch vụ 1</a></li>
                        <li><a href="#" className="hover:underline">Dịch vụ 2</a></li>
                        <li><a href="#" className="hover:underline">Dịch vụ 3</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2">Khóa học</h3>
                    <ul>
                        <li><a href="#" className="hover:underline">Khóa học 1</a></li>
                        <li><a href="#" className="hover:underline">Khóa học 2</a></li>
                        <li><a href="#" className="hover:underline">Khóa học 3</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2">Liên hệ</h3>
                    <ul>
                        <li><a href="#" className="hover:underline">Liên hệ 1</a></li>
                        <li><a href="#" className="hover:underline">Liên hệ 2</a></li>
                        <li><a href="#" className="hover:underline">Liên hệ 3</a></li>
                    </ul>
                </div>
            </div>
            <div className="text-center mt-8">
                <p>&copy; 2023 TITV.vn. All rights reserved.</p>
            </div>
        </div>
    </footer>
);
