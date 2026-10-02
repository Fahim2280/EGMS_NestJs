export interface CreatePasswordResetTokenProps {
    id: string;
    email: string;
    token: string;
    expiresAt: Date;
    isUsed?: boolean;
    createdAt?: Date;
}
export declare class PasswordResetToken {
    readonly id: string;
    readonly email: string;
    readonly token: string;
    readonly expiresAt: Date;
    isUsed: boolean;
    readonly createdAt: Date;
    constructor(props: CreatePasswordResetTokenProps);
    isValid(): boolean;
    markUsed(): void;
}
