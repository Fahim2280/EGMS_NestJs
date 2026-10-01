import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  COMPANY_REPOSITORY_TOKEN,
  GARAGE_REPOSITORY_TOKEN,
  EMPLOYEE_REPOSITORY_TOKEN,
  CUSTOMER_REPOSITORY_TOKEN,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  GUARANTOR_REPOSITORY_TOKEN,
  PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
  AUDIT_LOG_REPOSITORY_TOKEN,
  COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN,
} from '@domain/index';
import { CompanyOrmEntity } from './typeorm/entities/company.orm-entity';
import { GarageOrmEntity } from './typeorm/entities/garage.orm-entity';
import { EmployeeOrmEntity } from './typeorm/entities/employee.orm-entity';
import { CustomerOrmEntity } from './typeorm/entities/customer.orm-entity';
import { ElectricBillOrmEntity } from './typeorm/entities/electric-bill.orm-entity';
import { GuarantorOrmEntity } from './typeorm/entities/guarantor.orm-entity';
import { PasswordResetTokenOrmEntity } from './typeorm/entities/password-reset-token.orm-entity';
import { AuditLogOrmEntity } from './typeorm/entities/audit-log.orm-entity';
import { CompanyApprovalTokenOrmEntity } from './typeorm/entities/company-approval-token.orm-entity';
import { TypeOrmCompanyRepository } from './typeorm/repositories/typeorm-company.repository';
import { TypeOrmGarageRepository } from './typeorm/repositories/typeorm-garage.repository';
import { TypeOrmEmployeeRepository } from './typeorm/repositories/typeorm-employee.repository';
import { TypeOrmCustomerRepository } from './typeorm/repositories/typeorm-customer.repository';
import { TypeOrmElectricBillRepository } from './typeorm/repositories/typeorm-electric-bill.repository';
import { TypeOrmGuarantorRepository } from './typeorm/repositories/typeorm-guarantor.repository';
import { TypeOrmPasswordResetTokenRepository } from './typeorm/repositories/typeorm-password-reset-token.repository';
import { TypeOrmAuditLogRepository } from './typeorm/repositories/typeorm-audit-log.repository';
import { TypeOrmCompanyApprovalTokenRepository } from './typeorm/repositories/typeorm-company-approval-token.repository';
import { DatabaseSeederService } from './typeorm/database-seeder.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', 'pandaKnight009'),
        database: config.get<string>('DB_DATABASE', 'egms_db'),
        entities: [
          CompanyOrmEntity,
          GarageOrmEntity,
          EmployeeOrmEntity,
          CustomerOrmEntity,
          ElectricBillOrmEntity,
          GuarantorOrmEntity,
          PasswordResetTokenOrmEntity,
          AuditLogOrmEntity,
          CompanyApprovalTokenOrmEntity,
        ],
        synchronize:
          config.get<string>('NODE_ENV') !== 'production' &&
          config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
        extra: {
          connectionLimit: Number(config.get<number>('DB_CONNECTION_LIMIT', 10)),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      CompanyOrmEntity,
      GarageOrmEntity,
      EmployeeOrmEntity,
      CustomerOrmEntity,
      ElectricBillOrmEntity,
      GuarantorOrmEntity,
      PasswordResetTokenOrmEntity,
      AuditLogOrmEntity,
      CompanyApprovalTokenOrmEntity,
    ]),
  ],
  providers: [
    TypeOrmCompanyRepository,
    TypeOrmGarageRepository,
    TypeOrmEmployeeRepository,
    TypeOrmCustomerRepository,
    TypeOrmElectricBillRepository,
    TypeOrmGuarantorRepository,
    TypeOrmPasswordResetTokenRepository,
    TypeOrmAuditLogRepository,
    TypeOrmCompanyApprovalTokenRepository,
    DatabaseSeederService,
    {
      provide: COMPANY_REPOSITORY_TOKEN,
      useExisting: TypeOrmCompanyRepository,
    },
    {
      provide: GARAGE_REPOSITORY_TOKEN,
      useExisting: TypeOrmGarageRepository,
    },
    {
      provide: EMPLOYEE_REPOSITORY_TOKEN,
      useExisting: TypeOrmEmployeeRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY_TOKEN,
      useExisting: TypeOrmCustomerRepository,
    },
    {
      provide: ELECTRIC_BILL_REPOSITORY_TOKEN,
      useExisting: TypeOrmElectricBillRepository,
    },
    {
      provide: GUARANTOR_REPOSITORY_TOKEN,
      useExisting: TypeOrmGuarantorRepository,
    },
    {
      provide: PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
      useExisting: TypeOrmPasswordResetTokenRepository,
    },
    {
      provide: AUDIT_LOG_REPOSITORY_TOKEN,
      useExisting: TypeOrmAuditLogRepository,
    },
    {
      provide: COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN,
      useExisting: TypeOrmCompanyApprovalTokenRepository,
    },
  ],
  exports: [
    TypeOrmModule,
    COMPANY_REPOSITORY_TOKEN,
    GARAGE_REPOSITORY_TOKEN,
    EMPLOYEE_REPOSITORY_TOKEN,
    CUSTOMER_REPOSITORY_TOKEN,
    ELECTRIC_BILL_REPOSITORY_TOKEN,
    GUARANTOR_REPOSITORY_TOKEN,
    PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
    AUDIT_LOG_REPOSITORY_TOKEN,
    COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN,
  ],
})
export class PersistenceModule {}

