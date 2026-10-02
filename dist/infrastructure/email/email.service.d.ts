import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class EmailService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    private getTransporter;
    testSmtpConnection(): Promise<{
        success: boolean;
        config: any;
        message: string;
    }>;
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
    sendWelcomeEmail(to: string, companyName: string): Promise<void>;
    sendCompanyApprovalRequestEmail(to: string, companyName: string, companyEmail: string, approveUrl: string, rejectUrl: string): Promise<void>;
}
