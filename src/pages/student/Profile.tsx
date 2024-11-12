import React, { useEffect, useState } from "react";
import { SearchHeaderAndFooterLayout } from "../../layouts/UserLayout";
import { Mail, Phone, CalendarDays, User, MoreHorizontal, Check, X, Upload } from "lucide-react";

interface UserData {
    id: number;
    username: string;
    email: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    isActive: boolean;
    isBlocked: boolean;
    money: number;
    point: number;
    avatar: string;
}

export function Profile() {
    const [userData, setUserData] = useState<UserData | null>({
        id: 1,
        username: "hoanganh",
        email: "hoanganh@gmail.com",
        fullName: "Hoàng Anh",
        dateOfBirth: "1990-05-15",
        gender: "Male",
        phoneNumber: "0123456789",
        isActive: true,
        isBlocked: false,
        money: 1000,
        point: 500,
        avatar: "https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-6/416238737_2395657973950734_3403316050107008880_n.jpg?stp=cp6_dst-jpg&_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=Uw9WhVETCh4Q7kNvgE9J-QN&_nc_zt=23&_nc_ht=scontent.fsgn2-3.fna&_nc_gid=AtlHbcurO4hk2fKzyA5sGqc&oh=00_AYCIQyqv4lFc2C1Cfzsesqry_zd8x7bIfbbls3NGxnTXGQ&oe=67394C38",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [avatarChanged, setAvatarChanged] = useState(false);
    const [prevAvatar, setPrevAvatar] = useState<string | null>(null);

    // useEffect(() => {
    //   // Fetch user data from API
    //   // Update userData state with the fetched data
    // }, []);

    const handleChangePassword = () => {
        // Logic to change password
        console.log("Change Password Clicked");
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPrevAvatar(userData?.avatar || null);
            const reader = new FileReader();
            reader.onload = (event) => {
                setUserData((prev) => prev ? ({ ...prev, avatar: event.target?.result as string }) : null);
                setAvatarChanged(true);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveAvatar = async () => {
        // Logic to save avatar to the server
        // You can send the userData.avatar to the server using an API call
        // After successful save, set avatarChanged back to false
        setAvatarChanged(false);
        setPrevAvatar(null);
    };

    const handleCancelAvatar = () => {
        if (prevAvatar) {
            setUserData((prev) => prev ? ({ ...prev, avatar: prevAvatar }) : null);
            setPrevAvatar(null);
        }
        setAvatarChanged(false);
    };

    return (
        <SearchHeaderAndFooterLayout>
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6">Hồ sơ người dùng</h1>
                {loading ? (
                    <div>Đang tải...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : userData ? (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3">
                            <div className="md:col-span-1 p-6 flex flex-col items-center justify-center border-r">
                                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4">
                                    <img src={userData.avatar} alt="User Avatar"
                                         className="w-full h-full object-cover"/>
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <label
                                            htmlFor="avatar-upload"
                                            className="p-2 bg-blue-500 text-white rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition-colors duration-300 transform hover:scale-110"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span className="sr-only">Upload Avatar</span>
                                            <input id="avatar-upload" type="file" accept="image/*" className="hidden"
                                                   onChange={handleAvatarUpload}/>
                                        </label>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold">{userData.fullName}</h2>
                                <p className="text-gray-500">{userData.username}</p>
                                {avatarChanged && (
                                    <div className="mt-4 space-x-2">
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            onClick={handleSaveAvatar}
                                        >
                                            Save Avatar
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                            onClick={handleCancelAvatar}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-2 p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Thông tin liên hệ</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <Mail className="w-5 h-5 mr-2 text-gray-500"/>
                                                <span>{userData.email}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="w-5 h-5 mr-2 text-gray-500"/>
                                                <span>{userData.phoneNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Thông tin cá nhân</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <CalendarDays className="w-5 h-5 mr-2 text-gray-500"/>
                                                <span>Ngày sinh: {userData.dateOfBirth}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MoreHorizontal className="w-5 h-5 mr-2 text-gray-500"/>
                                                <span>Giới tính: {userData.gender}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Trạng thái tài khoản</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                {userData.isActive ?
                                                    <Check className="w-5 h-5 mr-2 text-green-500"/> :
                                                    <X className="w-5 h-5 mr-2 text-red-500"/>
                                                }
                                                <span>Hoạt động: {userData.isActive ? "Có" : "Không"}</span>
                                            </div>
                                            <div className="flex items-center">
                                                {userData.isBlocked ?
                                                    <X className="w-5 h-5 mr-2 text-red-500"/> :
                                                    <Check className="w-5 h-5 mr-2 text-green-500"/>
                                                }
                                                <span>Bị chặn: {userData.isBlocked ? "Có" : "Không"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Tài chính và điểm thưởng</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <span className="font-semibold">Tiền:</span>
                                                <span className="ml-2">{userData.money.toLocaleString()} VND</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold">Điểm:</span>
                                                <span className="ml-2">{userData.point}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-100 px-6 py-4 flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 text-blue-500 font-semibold border border-blue-500 rounded-md hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-300"
                                onClick={handleChangePassword}
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>Không có dữ liệu người dùng.</div>
                )}
            </div>
        </SearchHeaderAndFooterLayout>
    );
}