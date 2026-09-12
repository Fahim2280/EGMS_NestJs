import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CompanyOrmEntity } from './entities/company.orm-entity';
import { GarageOrmEntity } from './entities/garage.orm-entity';
import { EmployeeOrmEntity } from './entities/employee.orm-entity';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(CompanyOrmEntity)
    private readonly companyRepo: Repository<CompanyOrmEntity>,
    @InjectRepository(GarageOrmEntity)
    private readonly garageRepo: Repository<GarageOrmEntity>,
    @InjectRepository(EmployeeOrmEntity)
    private readonly employeeRepo: Repository<EmployeeOrmEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    try {
      const companyCount = await this.companyRepo.count();
      if (companyCount > 0) return;

      this.logger.log('🌱 Seeding initial demo Company, Garage, and General Employee...');

      // 1. Seed Company (Super Admin)
      const salt = await bcrypt.genSalt(10);
      const companyPassword = await bcrypt.hash('Admin@123', salt);

      const company = new CompanyOrmEntity();
      company.id = 'comp-apex-001';
      company.name = 'Alexander Vance';
      company.companyName = 'Apex Auto Solutions Ltd.';
      company.email = 'admin@apexauto.com';
      company.password = companyPassword;
      company.phoneNumber = '+1-555-0188';
      company.role = 'SUPER_ADMIN';
      company.address = '742 Evergreen Terrace, Industrial Zone, Suite 400';
      company.createdBy = 'SYSTEM|SEEDER';
      company.editByName = 'SYSTEM|SEEDER';
      company.isActive = true;
      company.isDeleted = false;

      await this.companyRepo.save(company);
      this.logger.log(`✅ Company seeded: ${company.companyName} (${company.email})`);

      // 2. Seed Garage (connected to Company)
      const garage = new GarageOrmEntity();
      garage.id = 'gar-apex-001';
      garage.garageName = 'Apex Central Workshop & Diagnostic Garage';
      garage.address = 'Bay 12, West Industrial District, Metro City';
      garage.companyId = company.id;
      garage.createdBy = 'SYSTEM|SEEDER';
      garage.editByName = 'SYSTEM|SEEDER';
      garage.isActive = true;
      garage.isDeleted = false;

      await this.garageRepo.save(garage);
      this.logger.log(`✅ Garage seeded: ${garage.garageName}`);

      // 3. Seed Employee (connected to Company, GENERAL role, NID)
      const employeePassword = await bcrypt.hash('Employee@123', salt);

      const employee = new EmployeeOrmEntity();
      employee.id = 'emp-apex-001';
      employee.companyId = company.id;
      employee.name = 'Johnathan Doe';
      employee.address = '15 Elm Street, North Suburb';
      employee.email = 'john.doe@apexauto.com';
      employee.password = employeePassword;
      employee.phoneNumber = '+1-555-0144';
      employee.role = 'GENERAL';
      employee.nidNumber = '1992837465012';
      employee.createdBy = 'SYSTEM|SEEDER';
      employee.editByName = 'SYSTEM|SEEDER';
      employee.isActive = true;
      employee.isDeleted = false;


      await this.employeeRepo.save(employee);
      this.logger.log(`✅ Employee seeded: ${employee.name} (Role: ${employee.role}, NID: ${employee.nidNumber})`);
    } catch (error: any) {
      this.logger.error(`Failed to seed database: ${error.message}`, error.stack);
    }
  }
}
