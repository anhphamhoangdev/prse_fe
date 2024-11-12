import {ENDPOINTS} from "../constants/endpoint";
import {request, requestPost} from "../utils/request";


interface RegisterResponse {
    error_message: any;
    code: number;
    data: {
        student: any;
    };
}

interface ActivationResponse {
    success: boolean;
    error_message: any;
    code: number;
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

export async function activateStudentAccount(
    {email, activateCode}
        : {email: string | undefined , activateCode: string | undefined}
): Promise<ActivationResponse> {
    console.log(`[StudentService] Activate account for email : ${email}`);
    try {
        const endpoint = ENDPOINTS.STUDENT.ACTIVATE_ACCOUNT + `?email=${email}&activateCode=${activateCode}`

        const response = await request<RegisterResponse>(
            endpoint,
        );

        if (response.code === 1) {
            console.log(`[StudentService] Activate email ${email} successfully`);
            return {
                success: true,
                code: response.code,
                error_message: undefined
            };
        }
        console.warn("[StudentService][activateStudentAccount] Received unexpected response code:", response);
        return {
            success: false,
            code: response.code,
            error_message: response.error_message || "Activation failed. Please try again."
        };
    } catch (error) {
        console.error("[StudentService][activateStudentAccount] Error :", error);
        return {
            success: false,
            code: 0,
            error_message: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}