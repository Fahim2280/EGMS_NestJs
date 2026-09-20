import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  COMPANY_REPOSITORY_TOKEN,
  GARAGE_REPOSITORY_TOKEN,
  EMPLOYEE_REPOSITORY_TOKEN,
  CUSTOMER_REPOSITORY_TOKEN,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
} from '@domain/index';
import { CompanyOrmEntity } from './typeorm/entities/company.orm-entity';
import { GarageOrmEntity } from './typeorm/entities/garage.orm-entity';
import { EmployeeOrmEntity } from './typeorm/entities/employee.orm-entity';
import { CustomerOrmEntity } from './typeorm/entities/customer.orm-entity';
import { ElectricBillOrmEntity } from './typeorm/entities/electric-bill.orm-entity';
import { PasswordResetTokenOrmEntity } from './typeorm/entities/password-reset-token.orm-entity';
import { TypeOrmCompanyRepository } from './typeorm/repositories/typeorm-company.repository';
import { TypeOrmGarageRepository } from './typeorm/repositories/typeorm-garage.repository';
import { TypeOrmEmployeeRepository } from './typeorm/repositories/typeorm-employee.repository';
import { TypeOrmCustomerRepository } from './typeorm/repositories/typeorm-customer.repository';
import { TypeOrmElectricBillRepository } from './typeorm/repositories/typeorm-electric-bill.repository';
import { TypeOrmPasswordResetTokenRepository } from './typeorm/repositories/typeorm-password-reset-token.repository';
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
          PasswordResetTokenOrmEntity,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      CompanyOrmEntity,
      GarageOrmEntity,
      EmployeeOrmEntity,
      CustomerOrmEntity,
      ElectricBillOrmEntity,
      PasswordResetTokenOrmEntity,
    ]),
  ],
  providers: [
    TypeOrmCompanyRepository,
    TypeOrmGarageRepository,
    TypeOrmEmployeeRepository,
    TypeOrmCustomerRepository,
    TypeOrmElectricBillRepository,
    TypeOrmPasswordResetTokenRepository,
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
      provide: PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
      useExisting: TypeOrmPasswordResetTokenRepository,
    },
  ],
  exports: [
    TypeOrmModule,
    COMPANY_REPOSITORY_TOKEN,
    GARAGE_REPOSITORY_TOKEN,
    EMPLOYEE_REPOSITORY_TOKEN,
    CUSTOMER_REPOSITORY_TOKEN,
    ELECTRIC_BILL_REPOSITORY_TOKEN,
    PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
  ],
})
export class PersistenceModule {}
