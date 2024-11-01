import { useState } from "react";
import React from "react";
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordRequirement {
    text: string;
    validator: (password: string) => boolean;
}
// some conditions
const passwordRequirements: PasswordRequirement[] = [
    {
        text: "Ít nhất 8 ký tự",
        validator: (password) => password.length >= 8,
    },
    {
        text: "Ít nhất một chữ số",
        validator: (password) => /[0-9]/.test(password),
    },
    {
        text: "Ít nhất một chữ hoa",
        validator: (password) => /[A-Z]/.test(password),
    },
    {
        text: "Ít nhất một chữ thường",
        validator: (password) => /[a-z]/.test(password),
    },
    {
        text: "Ít nhất một ký tự đặc biệt",
        validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
];

// Component cho trường nhập mật khẩu chính
export const MainPasswordInput = ({
                               password,
                               setPassword,
                           }: {
    password: string;
    setPassword: (value: string) => void;
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
            </label>
            <div className="mt-1 relative">
                <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
            </div>
            {password && (
                <div className="mt-2">
                    <div className="grid grid-cols-2 gap-2">
                        {passwordRequirements.map((requirement, index) => {
                            const isValid = requirement.validator(password);
                            return (
                                <div
                                    key={index}
                                    className={`flex items-center text-sm ${
                                        isValid ? "text-green-600" : "text-gray-500"
                                    }`}
                                >
                                    {isValid ? (
                                        <Check className="h-4 w-4 min-w-[16px] mr-2" />
                                    ) : (
                                        <X className="h-4 w-4 min-w-[16px] mr-2" />
                                    )}
                                    <span className="truncate">{requirement.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// Component cho trường xác nhận mật khẩu
export const ConfirmPasswordInput = ({
                                  confirmPassword,
                                  setConfirmPassword,
                                  originalPassword,
                              }: {
    confirmPassword: string;
    setConfirmPassword: (value: string) => void;
    originalPassword: string;
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
            </label>
            <div className="mt-1 relative">
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
            </div>
            {confirmPassword && (
                <div className="mt-2">
                    {confirmPassword === originalPassword ? (
                        <div className="flex items-center text-sm text-green-600">
                            <Check className="h-4 w-4 mr-2" />
                            Mật khẩu khớp
                        </div>
                    ) : (
                        <div className="flex items-center text-sm text-red-600">
                            <X className="h-4 w-4 mr-2" />
                            Mật khẩu không khớp
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};