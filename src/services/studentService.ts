import {ENDPOINTS} from "../constants/endpoint";
import {request, requestPost} from "../utils/request";


interface RegisterResponse {
    error_message: any;
    code: number;
    data: {
        student: any;
    };
}

export async function checkUsernameExists(username: string): Promise<boolean> {
    console.log(`[StudentService] Checking if username ${username} exists`);
    try {
        const response = await requestPost<boolean>(
            ENDPOINTS.STUDENT.CHECK_USERNAME,
            {
                username
            }
        );

        if (response) {
            console.log(`[StudentService] Username ${username} exists:`, response);
            return response;
        }
        console.warn("[StudentService] Received unexpected response code:", response);
        return false;
    } catch (error) {
        console.error("[StudentService] Error checking username:", error);
        return false;
    }
}

export async function checkEmailExists(email: string): Promise<boolean> {
    console.log(`[StudentService] Checking if email ${email} exists`);
    try {
        const response = await requestPost<boolean>(
            ENDPOINTS.STUDENT.CHECK_EMAIL,
            {
                email
            }
        );

        if (response) {
            console.log(`[StudentService] Email ${email} exists:`, response);
            return response;
        }
        console.warn("[StudentService] Received unexpected response code:", response);
        return false;
    } catch (error) {
        console.error("[StudentService] Error checking username:", error);
        return false;
    }
}

export async function register({
                                   username,
                                   email,
                                   password,
                                   confirmPassword,
                                   fullName,
                                   gender,
                                   phoneNumber,
                                   dateOfBirth,
                                   agreeToTerms
                               }: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    gender: string;
    phoneNumber: string;
    dateOfBirth: string;
    agreeToTerms: boolean;
}) {

    console.log(`[StudentService] Register for username : ${username}`);
    try {
        const response = await requestPost<RegisterResponse>(
            ENDPOINTS.STUDENT.REGISTER,
            {
                username,
                email,
                passwordHash: password,
                fullName,
                gender,
                phoneNumber,
                dateOfBirth,
            }
        );

        if (response.code === 1) {
            console.log(`[StudentService] Register successfully`);
            return true;
        }
        console.warn("[StudentService] Received unexpected response code:", response);
        return false;
    } catch (error) {
        console.error("[StudentService] Error :", error);
        return false;
    }
}