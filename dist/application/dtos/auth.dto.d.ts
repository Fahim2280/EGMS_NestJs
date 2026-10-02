export declare class LoginDto {
    email: string;
    password: string;
}
export interface AuthenticatedUserPayload {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'GENERAL' | string;
    companyId: string;
    companyName?: string;
    phoneNumber?: string;
    nidNumber?: string;
    garageName?: string;
}
export declare class AuthResponseDto {
    success: boolean;
    message: string;
    data: {
        user: AuthenticatedUserPayload;
        accessToken: string;
    };
}
