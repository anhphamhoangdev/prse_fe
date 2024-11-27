import React from "react";
import {FormInputProps} from "../../types/upload-courses";


export const FormInput: React.FC<FormInputProps> = ({ icon: Icon, error, ...props }) => {
    return (
        <div className="relative rounded-md shadow-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
            </div>
            <input
                {...props}
                className={`block w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 border 
                    rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    transition duration-150 ease-in-out sm:text-sm hover:border-gray-400
                    ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
            />
        </div>
    );
};