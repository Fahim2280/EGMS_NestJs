import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';

// Services
import { BillingCalculationService } from './services/billing-calculation.service';

// Command Handlers
import { RegisterCompanyHandler } from './commands/handlers/register-company.handler';
import { CreateGarageHandler } from './commands/handlers/create-garage.handler';
import { UpdateGarageHandler } from './commands/handlers/update-garage.handler';
import { CreateEmployeeHandler } from './commands/handlers/create-employee.handler';
import { UpdateEmployeeHandler } from './commands/handlers/update-employee.handler';
import { DeleteEmployeeHandler } from './commands/handlers/delete-employee.handler';
import { LoginHandler } from './commands/handlers/login.handler';
import { CreateCustomerHandler } from './commands/handlers/create-customer.handler';
import { UpdateCustomerHandler } from './commands/handlers/update-customer.handler';
import { DeleteCustomerHandler } from './commands/handlers/delete-customer.handler';
import { CreateElectricBillHandler } from './commands/handlers/create-electric-bill.handler';
import { UpdateElectricBillHandler } from './commands/handlers/update-electric-bill.handler';
import { DeleteElectricBillHandler } from './commands/handlers/delete-electric-bill.handler';
import { GenerateMonthlyBillsHandler } from './commands/handlers/generate-monthly-bills.handler';
import { ForgotPasswordHandler } from './commands/handlers/forgot-password.handler';
import { ResetPasswordHandler } from './commands/handlers/reset-password.handler';
import { UpdateCompanyHandler } from './commands/handlers/update-company.handler';
import { UpdateEmployeePermissionHandler } from './commands/handlers/update-employee-permission.handler';
import { CreateGuarantorHandler } from './commands/handlers/create-guarantor.handler';
import { UpdateGuarantorHandler } from './commands/handlers/update-guarantor.handler';
import { DeleteGuarantorHandler } from './commands/handlers/delete-guarantor.handler';

// Query Handlers
import { GetCompanyByIdHandler } from './queries/handlers/get-company-by-id.handler';
import { GetGaragesByCompanyHandler } from './queries/handlers/get-garages-by-company.handler';
import { GetGarageByIdHandler } from './queries/handlers/get-garage-by-id.handler';
import { GetGarageDashboardHandler } from './queries/handlers/get-garage-dashboard.handler';
import { GetEmployeesByCompanyHandler } from './queries/handlers/get-employees-by-company.handler';
import { GetEmployeeByIdHandler } from './queries/handlers/get-employee-by-id.handler';
import { GetDashboardStatsHandler } from './queries/handlers/get-dashboard-stats.handler';
import { GetCustomersByCompanyHandler } from './queries/handlers/get-customers-by-company.handler';
import { GetCustomerByIdHandler } from './queries/handlers/get-customer-by-id.handler';
import { GetElectricBillsByCompanyHandler } from './queries/handlers/get-electric-bills-by-company.handler';
import { GetElectricBillByIdHandler } from './queries/handlers/get-electric-bill-by-id.handler';
import { GetCustomerBillSummaryHandler } from './queries/handlers/get-customer-bill-summary.handler';
import { PreviewElectricBillHandler } from './queries/handlers/preview-electric-bill.handler';
import { GetExecutiveDashboardHandler } from './queries/handlers/get-executive-dashboard.handler';
import { GetGuarantorsByCustomerHandler } from './queries/handlers/get-guarantors-by-customer.handler';

// AutoMapper Profiles
import { CompanyProfile } from './mappings/company.profile';
import { GarageProfile } from './mappings/garage.profile';
import { EmployeeProfile } from './mappings/employee.profile';

const CommandHandlers = [
  RegisterCompanyHandler,
  CreateGarageHandler,
  UpdateGarageHandler,
  CreateEmployeeHandler,
  UpdateEmployeeHandler,
  DeleteEmployeeHandler,
  LoginHandler,
  CreateCustomerHandler,
  UpdateCustomerHandler,
  DeleteCustomerHandler,
  CreateElectricBillHandler,
  UpdateElectricBillHandler,
  DeleteElectricBillHandler,
  GenerateMonthlyBillsHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  UpdateCompanyHandler,
  UpdateEmployeePermissionHandler,
  CreateGuarantorHandler,
  UpdateGuarantorHandler,
  DeleteGuarantorHandler,
];

const QueryHandlers = [
  GetCompanyByIdHandler,
  GetGaragesByCompanyHandler,
  GetGarageByIdHandler,
  GetGarageDashboardHandler,
  GetEmployeesByCompanyHandler,
  GetEmployeeByIdHandler,
  GetDashboardStatsHandler,
  GetCustomersByCompanyHandler,
  GetCustomerByIdHandler,
  GetElectricBillsByCompanyHandler,
  GetElectricBillByIdHandler,
  GetCustomerBillSummaryHandler,
  PreviewElectricBillHandler,
  GetExecutiveDashboardHandler,
  GetGuarantorsByCustomerHandler,
];

const Profiles = [
  CompanyProfile,
  GarageProfile,
  EmployeeProfile,
];

@Module({
  imports: [
    CqrsModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'super_secret_jwt_egms_key_2026_enterprise_secure!',
        ),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN', '7d')) as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    BillingCalculationService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Profiles,
  ],
  exports: [CqrsModule, JwtModule, AutomapperModule, BillingCalculationService],
})
export class ApplicationModule {}
