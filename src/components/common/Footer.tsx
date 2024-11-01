import React from "react";

export const Footer = () => (
    // <footer className="bg-gray-800 text-white py-8 mt-8 w-full">
    //     <div className="container mx-auto px-4">
    //         <div className="grid grid-cols-4 gap-4">
    //             <div>
    //                 <h3 className="text-lg font-bold mb-2">TITV.vn</h3>
    //                 <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</p>
    //                 <p>Email: contact@titv.vn</p>
    //                 <p>Điện thoại: 0123 456 789</p>
    //             </div>
    //         </div>
    //         <div className="text-center mt-8">
    //             <p>&copy; 2023 TITV.vn. All rights reserved.</p>
    //         </div>
    //     </div>
    // </footer>

    <footer className="bg-gray-800 text-white py-8 mt-8 w-full">
        <div className="container mx-auto px-4">
            <div className="flex justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">EasyEdu.vn</h3>
                    <p>Địa chỉ: Số 1, Võ Văn Ngân, P. Linh Chiểu, Q. Thủ Đức, Tp. Hồ Chí Minh</p>
                    <p>
                        Email: <a href="mailto:anhphamhoang033@gmail.com"
                                  className="text-blue-400 underline">anhphamhoang033@gmail.com</a>
                    </p>
                    <p>Điện thoại: 0914 311 299</p>
                </div>
            </div>
            <div className="text-center mt-8">
                <p>&copy; 2024 EasyEdu.vn. All rights reserved.</p>
            </div>
        </div>
    </footer>


);
