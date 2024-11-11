import {useEffect, useState} from "react";
import React from "react";
import {SearchHeaderAndFooterLayout} from "../layouts/UserLayout";
import {Link} from "react-router-dom";
import {ConfirmPasswordInput, MainPasswordInput} from "../components/common/PasswordSignupInput";
import {checkEmailExists, checkUsernameExists, register} from "../services/studentService";

export function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [notification, setNotification] = useState("")
    const [errorNotification, setErrorNotification] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // is valid
    const [isValidPassword, setValidPassword] = useState<boolean>(false);
    const [isValidConfirmPassword, setValidConfirmPassword] = useState<boolean>(false);
    const [isValidUsername, setValidUsername] = useState<boolean>(false);
    const [isValidEmail, setValidEmail] = useState<boolean>(false);


    // error variable
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    // const [phoneError, setPhoneError] = useState('');

    // check
    const checkUsername = async (username: string) => {
        try {
            let usernameExists = await checkUsernameExists(username);

            setValidUsername(!usernameExists);


            if(usernameExists)
            {
                setUsernameError('Tên đăng nhập đã tồn tại');
            }
            else setUsernameError('');


        } catch (err) {
            setUsernameError('Đã có lỗi xảy ra !');
        }
    };

    const checkEmail = async (email: string) => {
        try {
            let emailExists = await checkEmailExists(email);

            // neu exist = true => valid = false
            setValidEmail(!emailExists)

            if(emailExists)
            {
                setEmailError('Email đã tồn tại');
            }else
            {
                setEmailError('');

            }
        } catch (err) {
            setEmailError('Email đã tồn tại');
        }
    };

    // const checkPhone = async (phone: string) => {
    //     try {
    //         // await checkPhoneExists(phone);
    //         setPhoneError('Số điện thoại đã tồn tại');
    //     } catch (err) {
    //         setPhoneError('Số điện thoại đã tồn tại');
    //     }
    // };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        window.scrollTo({ top: 0, behavior: 'smooth' });

        setNotification("")
        setErrorNotification("")
        setUsernameError("")
        setEmailError("")

        // check again
        let emailExists = await checkEmailExists(email);
        let usernameExists = await checkUsernameExists(username);

        if(emailExists || usernameExists)
        {
            setErrorNotification("Email hoặc username đã tồn tại !")
            return;
        }

        if(isValidPassword && isValidUsername && isValidConfirmPassword && isValidEmail)
        {
            setIsLoading(true);

            let isRegisterSuccess: boolean = await register({
                                                                username,
                                                                email,
                                                                password,
                                                                confirmPassword,
                                                                fullName,
                                                                gender,
                                                                phoneNumber,
                                                                dateOfBirth,
                                                                agreeToTerms
                                                    });

            setIsLoading(false);

            if(isRegisterSuccess)
            {
                setUsername("")
                setEmail("")
                setPassword("")
                setConfirmPassword("")
                setFullName("")
                setGender("")
                setPhoneNumber("")
                setDateOfBirth("")
                setNotification("Register successfully, please check your email to active your account !");
            }
            else{
                setNotification("Error ! Please try again.")
            }
        }else alert("Vui lòng điền đúng theo yêu cầu !")
    };


    return (
        <SearchHeaderAndFooterLayout>
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="relative w-20 h-20">
                        <div
                            className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600"/>
                    </div>
                </div>
            )}
            <div className="flex-1 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Tạo tài khoản mới nhé !
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Đã có tài khoản ?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Đăng nhập
                        </Link>
                    </p>
                </div>


                <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
                    {errorNotification ? (
                        <div className="flex items-center justify-center border border-red-600 h-10 ">
                            <div className="text-red-600 text-center">{errorNotification}</div>
                        </div>
                    ): null}
                    {notification ? (
                        <div className="flex items-center justify-center border border-green-600 h-10 ">
                            <div className="text-green-600 text-center">{notification}</div>
                        </div>
                    ): null}
                    <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">

                        <form className="space-y-5" onSubmit={handleSignup}>
                            {/* Grid layout for first row */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Tên đăng nhập
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value);
                                                if (e.target.value) checkUsername(e.target.value);
                                            }}
                                            placeholder="username123"
                                            className={`appearance-none block w-full px-3 py-2 border ${
                                                usernameError ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                        />
                                        {usernameError && (
                                            <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value)
                                                if (e.target.value) checkEmail(e.target.value);
                                            }}
                                            placeholder="example@gmail.com"
                                            className={`appearance-none block w-full px-3 py-2 border ${
                                                emailError ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                        />
                                        {emailError && (
                                            <p className="mt-1 text-sm text-red-600">{emailError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Grid layout for second row */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                        Họ và tên
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                        Số điện thoại
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="0123456789"
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Grid layout for third row */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                        Ngày sinh
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            type="date"
                                            required
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                        Giới tính
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            id="gender"
                                            name="gender"
                                            required
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Password fields */}
                            <MainPasswordInput
                                password={password}
                                setPassword={setPassword}
                                setValidPassword={setValidPassword}
                            />

                            <ConfirmPasswordInput
                                confirmPassword={confirmPassword}
                                setConfirmPassword={setConfirmPassword}
                                originalPassword={password}
                                setValidConfirmPassword={setValidConfirmPassword}
                            />

                            {/* Terms and conditions */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={agreeToTerms}
                                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                                        required
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-700">
                                        Tôi đồng ý với{' '}
                                        <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                                            Điều khoản sử dụng
                                        </Link>
                                        {' '}và{' '}
                                        <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                                            Chính sách bảo mật
                                        </Link>
                                    </label>
                                </div>
                            </div>

                            {/* Submit button */}
                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Tạo tài khoản
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
}