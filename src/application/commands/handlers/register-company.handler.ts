import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterCompanyCommand } from '../impl/register-company.command';
import {
  Company,
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  Garage,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';
import { EmailService } from '@infrastructure/email/email.service';

@CommandHandler(RegisterCompanyCommand)
export class RegisterCompanyHandler implements ICommandHandler<RegisterCompanyCommand> {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    private readonly emailService: EmailService,
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

    // Send welcome email (fire-and-forget — don't block registration on email failure)
    this.emailService.sendWelcomeEmail(dto.email, dto.companyName).catch(() => {});

    return company;
  }
}
