import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginCommand } from '../impl/login.command';
import {
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';
import { AuthResponseDto } from '../../dtos/auth.dto';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { email, password } = command.dto;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try authenticating as Company (Super Admin)
    const company = await this.companyRepo.findByEmail(normalizedEmail);
    if (company) {
      const isMatch = await bcrypt.compare(password, company.password);
      if (isMatch) {
        const garages = await this.garageRepo.findByCompanyId(company.id);
        const payload = {
          id: company.id,
          sub: company.id,
          email: company.email,
          name: company.name,
          role: company.role || 'SUPER_ADMIN',
          companyId: company.id,
          companyName: company.companyName,
          phoneNumber: company.phoneNumber,
          garageName: garages.length > 0 ? garages[0].garageName : undefined,
        };

        const accessToken = this.jwtService.sign(payload);
        return {
          success: true,
          message: 'Company Super Admin authenticated successfully',
          data: {
            user: payload,
            accessToken,
          },
        };
      }
    }

    // 2. Try authenticating as Employee (General)
    const employee = await this.employeeRepo.findByEmail(normalizedEmail);
    if (employee) {
      const isMatch = await bcrypt.compare(password, employee.password);
      if (isMatch) {
        if (!employee.isActive || employee.isDeleted) {
          throw new UnauthorizedException(
            'Your employee account has been deactivated or suspended. Please contact your company administrator.',
          );
        }
        const companyOfEmployee = await this.companyRepo.findById(employee.companyId);
        const payload = {
          id: employee.id,
          sub: employee.id,
          email: employee.email,
          name: employee.name,
          role: employee.role || 'GENERAL',
          companyId: employee.companyId,
          companyName: companyOfEmployee?.companyName || 'Associated Company',
          phoneNumber: employee.phoneNumber,
          nidNumber: employee.nidNumber,
          isSuperAdmin: employee.role === 'SUPER_ADMIN',
          canCreate: Boolean(employee.canCreate),
          canEdit: Boolean(employee.canEdit),
          canDelete: Boolean(employee.canDelete),
          canView: Boolean(employee.canView),
          garageIds: employee.permittedGarageIds || [],
        };

        const accessToken = this.jwtService.sign(payload);
        return {
          success: true,
          message: 'Employee authenticated successfully',
          data: {
            user: payload,
            accessToken,
          },
        };
      }
    }

    throw new UnauthorizedException('Invalid email or password');
  }
}
