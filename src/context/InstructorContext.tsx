import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {InstructorData} from "../types/users";
import {requestWithAuth} from "../utils/request";
import {ENDPOINTS} from "../constants/endpoint";

interface InstructorAuthResponse {
    instructor: InstructorData;
}

// Context để share instructor data
export const InstructorContext = React.createContext<{
    instructor: InstructorData | null;
    setInstructor: (instructor: InstructorData | null) => void;
}>({
    instructor: null,
    setInstructor: () => {}
});

export const withInstructorAuth = (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => {
        const navigate = useNavigate();
        const [loading, setLoading] = useState(true);
        const [instructor, setInstructor] = useState<InstructorData | null>(null);

        useEffect(() => {
            const checkInstructorAuth = async () => {
                try {
                    const response = await requestWithAuth<InstructorAuthResponse>(ENDPOINTS.INSTRUCTOR.PROFILE);
                    if (response.instructor) {
                        setInstructor(response.instructor);
                    } else {
                        // Nếu không phải instructor, redirect về trang chủ
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Error fetching instructor profile:', error);
                    // Nếu có lỗi (401, 403, etc), redirect về trang chủ
                    navigate('/');
                } finally {
                    setLoading(false);
                }
            };

            checkInstructorAuth();
        }, [navigate]);

        if (loading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        // Chỉ render component khi đã có instructor data
        if (!instructor) {
            return null;
        }

        return (
            <InstructorContext.Provider value={{ instructor, setInstructor }}>
                <WrappedComponent {...props} instructor={instructor} />
            </InstructorContext.Provider>
        );
    };
};