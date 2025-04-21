export interface InstructorData {
    id: number;
    studentId: number;
    fullName: string;
    money: number;
    totalRevenue: number;
    fee: number;
    avatarUrl: string | null;
    title: string;
    totalStudent: number;
    totalCourse: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserData {
    id: number;
    username: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    money: number;
    point: number;
    instructor: boolean;
}

export interface AdminData {
    id: number;
    email: string;
    fullName: string;
    isAdmin: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}