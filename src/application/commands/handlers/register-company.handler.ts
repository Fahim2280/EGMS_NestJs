import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { RegisterCompanyCommand } from '../impl/register-company.command';
import {
  Company,
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  Garage,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
  CompanyApprovalToken,
  COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN,
  ICompanyApprovalTokenRepository,
} from '@domain/index';
import { EmailService } from '@infrastructure/email/email.service';

@CommandHandler(RegisterCompanyCommand)
export class RegisterCompanyHandler implements ICommandHandler<RegisterCompanyCommand> {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    @Inject(COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN)
    private readonly approvalTokenRepo: ICompanyApprovalTokenRepository,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(command: RegisterCompanyCommand): Promise<Company> {
    const { dto } = command;
    const existing = await this.companyRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Company with email '${dto.email}' already exists.`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);
    const companyId = uuidv4();

    const company = Company.create({
      id: companyId,
      name: dto.name,
      companyName: dto.companyName,
      email: dto.email,
      password: hashedPassword,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      role: 'SUPER_ADMIN',
      createdBy: `${companyId}|SUPER_ADMIN`,
    });

    await this.companyRepo.save(company);

    // If initial garage information is provided, create the garage
    if (dto.initialGarageName && dto.initialGarageAddress) {
      const garage = Garage.create({
        id: uuidv4(),
        companyId: companyId,
        garageName: dto.initialGarageName,
        address: dto.initialGarageAddress,
        createdBy: `${companyId}|SUPER_ADMIN`,
      });
      await this.garageRepo.save(garage);
    }

    // Generate a cryptographically secure approval token (expires in 48 hours)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiryHours = Number(
      this.config.get<string>('APPROVAL_TOKEN_EXPIRY_HOURS') || 48,
    );
    const approvalToken = new CompanyApprovalToken({
      id: uuidv4(),
      companyId: companyId,
      token: rawToken,
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    });
    await this.approvalTokenRepo.save(approvalToken);

    // Send approval request email to admin (fire-and-forget)
    const appUrl =
      this.config.get<string>('APP_URL') || 'http://localhost:3000';
    const adminEmail =
      this.config.get<string>('ADMIN_APPROVAL_EMAIL') || 'kfahim2280@gmail.com';
    const approveUrl = `${appUrl}/company/approve?token=${rawToken}`;
    const rejectUrl = `${appUrl}/company/reject?token=${rawToken}`;
    this.emailService
      .sendCompanyApprovalRequestEmail(
        adminEmail,
        dto.companyName,
        dto.email,
        approveUrl,
        rejectUrl,
      )
      .catch(() => {});

    return company;
  }
}
