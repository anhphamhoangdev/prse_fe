import {Instructor} from "./course";

export interface WithdrawFormData {
    amount: number;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
}

export interface InstructorWithdraw{
    id: number;
    name: string;
    email: string;
}

export interface Withdrawal {
    id: number;
    instructor: InstructorWithdraw;
    amount: number;
    type: 'BANK' | 'STUDENT_ACCOUNT';
    status: 'PENDING' | 'COMPLETED' | 'REJECTED';
    bankCode?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

