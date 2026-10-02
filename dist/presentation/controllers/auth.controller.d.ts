import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response, Request } from 'express';
import { LoginDto } from "../../application/dtos/auth.dto";
import { RegisterCompanyDto } from "../../application/dtos/company.dto";
import { AuditLogService } from "../../application/services/audit-log.service";
import { EmailService } from "../../infrastructure/email/email.service";
export declare class AuthController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly auditLogService;
    private readonly emailService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, auditLogService: AuditLogService, emailService: EmailService);
    renderLogin(message: string, req: Request, res: Response): void;
    handleLogin(dto: LoginDto, req: Request, res: Response): Promise<void>;
    renderRegister(req: Request, res: Response): void;
    handleRegister(dto: RegisterCompanyDto, req: Request, res: Response): Promise<void>;
    renderForgotPassword(req: Request, res: Response): void;
    approveCompany(token: string, res: Response): Promise<void>;
    rejectCompany(token: string, res: Response): Promise<void>;
    handleForgotPassword(email: string, res: Response): Promise<void>;
    renderForgotPasswordConfirmation(res: Response): void;
    renderResetPassword(token: string, email: string, res: Response): void;
    handleResetPassword(token: string, email: string, password: string, res: Response): Promise<void>;
    renderProfileEdit(req: Request, res: Response): Promise<void>;
    handleProfileEdit(body: any, req: Request, res: Response): Promise<void>;
    handleLogout(req: Request, res: Response): Promise<void>;
    testEmailStatus(res: Response): Promise<Response<any, Record<string, any>>>;
}
