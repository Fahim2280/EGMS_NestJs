export declare class PasswordResetTokenOrmEntity {
    id: string;
    email: string;
    token: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}
