import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';

// Command Handlers
import { RegisterCompanyHandler } from './commands/handlers/register-company.handler';
import { CreateGarageHandler } from './commands/handlers/create-garage.handler';
import { CreateEmployeeHandler } from './commands/handlers/create-employee.handler';
import { LoginHandler } from './commands/handlers/login.handler';

// Query Handlers
import { GetCompanyByIdHandler } from './queries/handlers/get-company-by-id.handler';
import { GetGaragesByCompanyHandler } from './queries/handlers/get-garages-by-company.handler';
import { GetEmployeesByCompanyHandler } from './queries/handlers/get-employees-by-company.handler';
import { GetDashboardStatsHandler } from './queries/handlers/get-dashboard-stats.handler';

// AutoMapper Profiles
import { CompanyProfile } from './mappings/company.profile';
import { GarageProfile } from './mappings/garage.profile';
import { EmployeeProfile } from './mappings/employee.profile';

const CommandHandlers = [
  RegisterCompanyHandler,
  CreateGarageHandler,
  CreateEmployeeHandler,
  LoginHandler,
];

const QueryHandlers = [
  GetCompanyByIdHandler,
  GetGaragesByCompanyHandler,
  GetEmployeesByCompanyHandler,
  GetDashboardStatsHandler,
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
    ...CommandHandlers,
    ...QueryHandlers,
    ...Profiles,
  ],
  exports: [CqrsModule, JwtModule, AutomapperModule],
})
export class ApplicationModule {}
