import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  COMPANY_REPOSITORY_TOKEN,
  GARAGE_REPOSITORY_TOKEN,
  EMPLOYEE_REPOSITORY_TOKEN,
} from '@domain/index';
import { CompanyOrmEntity } from './typeorm/entities/company.orm-entity';
import { GarageOrmEntity } from './typeorm/entities/garage.orm-entity';
import { EmployeeOrmEntity } from './typeorm/entities/employee.orm-entity';
import { TypeOrmCompanyRepository } from './typeorm/repositories/typeorm-company.repository';
import { TypeOrmGarageRepository } from './typeorm/repositories/typeorm-garage.repository';
import { TypeOrmEmployeeRepository } from './typeorm/repositories/typeorm-employee.repository';
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
        entities: [CompanyOrmEntity, GarageOrmEntity, EmployeeOrmEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      CompanyOrmEntity,
      GarageOrmEntity,
      EmployeeOrmEntity,
    ]),
  ],
  providers: [
    TypeOrmCompanyRepository,
    TypeOrmGarageRepository,
    TypeOrmEmployeeRepository,
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
  ],
  exports: [
    TypeOrmModule,
    COMPANY_REPOSITORY_TOKEN,
    GARAGE_REPOSITORY_TOKEN,
    EMPLOYEE_REPOSITORY_TOKEN,
  ],
})
export class PersistenceModule {}
