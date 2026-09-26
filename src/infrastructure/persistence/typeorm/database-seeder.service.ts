import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CompanyOrmEntity } from './entities/company.orm-entity';
import { GarageOrmEntity } from './entities/garage.orm-entity';
import { EmployeeOrmEntity } from './entities/employee.orm-entity';
import { CustomerOrmEntity } from './entities/customer.orm-entity';
import { ElectricBillOrmEntity } from './entities/electric-bill.orm-entity';
import { GuarantorOrmEntity } from './entities/guarantor.orm-entity';

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
    @InjectRepository(CustomerOrmEntity)
    private readonly customerRepo: Repository<CustomerOrmEntity>,
    @InjectRepository(ElectricBillOrmEntity)
    private readonly billRepo: Repository<ElectricBillOrmEntity>,
    @InjectRepository(GuarantorOrmEntity)
    private readonly guarantorRepo: Repository<GuarantorOrmEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const allowSeed = process.env.ALLOW_SEED === 'true';

      if (isProd && !allowSeed) {
        this.logger.log('🔒 Production mode: Skipping automatic demo database seeding (ALLOW_SEED=false).');
        return;
      }

      const companyCount = await this.companyRepo.count();
      if (companyCount > 0) {
        // Seed customers and bills if missing
        await this.seedCustomersAndBills('comp-apex-001');
        await this.syncDemoGaragesAndPermissions('comp-apex-001');
        return;
      }

      this.logger.log('🌱 Seeding initial demo Company, Garages, Employee, Customers & Electric Bills...');

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

      // 2. Seed Garage 1 (connected to Company)
      const garage1 = new GarageOrmEntity();
      garage1.id = 'gar-apex-001';
      garage1.garageName = 'Apex Central Workshop & Diagnostic Garage';
      garage1.address = 'Bay 12, West Industrial District, Metro City';
      garage1.companyId = company.id;
      garage1.createdBy = 'SYSTEM|SEEDER';
      garage1.editByName = 'SYSTEM|SEEDER';
      garage1.isActive = true;
      garage1.isDeleted = false;

      await this.garageRepo.save(garage1);
      this.logger.log(`✅ Garage 1 seeded: ${garage1.garageName}`);

      // 2b. Seed Garage 2 (connected to Company)
      const garage2 = new GarageOrmEntity();
      garage2.id = 'gar-apex-002';
      garage2.garageName = 'Apex East Workshop & Battery Hub';
      garage2.address = 'Terminal 4, East Bypass Road, Metro City';
      garage2.companyId = company.id;
      garage2.createdBy = 'SYSTEM|SEEDER';
      garage2.editByName = 'SYSTEM|SEEDER';
      garage2.isActive = true;
      garage2.isDeleted = false;

      await this.garageRepo.save(garage2);
      this.logger.log(`✅ Garage 2 seeded: ${garage2.garageName}`);

      // 3. Seed Employee (Assigned to Garage 1 only)
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
      employee.canCreate = true;
      employee.canEdit = false;
      employee.canDelete = false;
      employee.canView = true;
      employee.permittedGarages = [garage1];
      employee.createdBy = 'SYSTEM|SEEDER';
      employee.editByName = 'SYSTEM|SEEDER';
      employee.isActive = true;
      employee.isDeleted = false;

      await this.employeeRepo.save(employee);
      this.logger.log(`✅ Employee seeded: ${employee.name} (Permitted to Garage 1 only)`);

      // 4. Seed Customers & Electric Bills
      await this.seedCustomersAndBills(company.id);
      await this.syncDemoGaragesAndPermissions(company.id);
    } catch (error: any) {
      this.logger.error(`Failed to seed database: ${error.message}`, error.stack);
    }
  }

  private async seedCustomersAndBills(companyId: string): Promise<void> {
    const custCount = await this.customerRepo.count({ where: { companyId } });
    if (custCount > 0) return;

    // Customer 1
    const cust1 = new CustomerOrmEntity();
    cust1.id = 'cust-apex-001';
    cust1.cId = 1;
    cust1.companyId = companyId;
    cust1.name = 'Mohammad Rahim';
    cust1.fatherName = 'Abdul Karim';
    cust1.motherName = 'Fatema Begum';
    cust1.address = 'Unit 4, North Industrial Yard, Gazipur';
    cust1.mobileNumber = '01712345678';
    cust1.nidNumber = '19851234567890123';
    cust1.previousUnit = 120.0;
    cust1.advanceMoney = 3000.0;
    cust1.garageId = 'gar-apex-001';
    cust1.createdBy = 'SYSTEM|SEEDER';
    cust1.isActive = true;
    cust1.isDeleted = false;
    await this.customerRepo.save(cust1);

    // Bill 1 for Customer 1: Reading 120 -> 220 (100 units consumed * 15 = 1500)
    // Prev Dues: 3000, Electric: 1500, Rent: 2000, Total: 6500. Paid: 5000. Present Dues: 1500.
    const bill1 = new ElectricBillOrmEntity();
    bill1.id = 'bill-apex-001';
    bill1.billNumber = 1;
    bill1.customerId = cust1.id;
    bill1.companyId = companyId;
    bill1.date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 1 month ago
    bill1.previousUnit = 120.0;
    bill1.currentUnit = 220.0;
    bill1.totalUnit = 100.0;
    bill1.electricBill = 1500.0;
    bill1.previousDues = 3000.0;
    bill1.rentBill = 2000.0;
    bill1.loan = 0.0;
    bill1.totalBill = 6500.0;
    bill1.clearMoney = 5000.0;
    bill1.presentDues = 1500.0;
    bill1.createdBy = 'SYSTEM|SEEDER';
    bill1.isActive = true;
    bill1.isDeleted = false;
    await this.billRepo.save(bill1);

    // Bill 2 for Customer 1: Reading 220 -> 340 (120 units * 15 = 1800)
    // Prev Dues: 1500, Electric: 1800, Rent: 2000, Total: 5300. Paid: 5300. Present Dues: 0.
    const bill2 = new ElectricBillOrmEntity();
    bill2.id = 'bill-apex-002';
    bill2.billNumber = 2;
    bill2.customerId = cust1.id;
    bill2.companyId = companyId;
    bill2.date = new Date();
    bill2.previousUnit = 220.0;
    bill2.currentUnit = 340.0;
    bill2.totalUnit = 120.0;
    bill2.electricBill = 1800.0;
    bill2.previousDues = 1500.0;
    bill2.rentBill = 2000.0;
    bill2.loan = 0.0;
    bill2.totalBill = 5300.0;
    bill2.clearMoney = 5300.0;
    bill2.presentDues = 0.0;
    bill2.createdBy = 'SYSTEM|SEEDER';
    bill2.isActive = true;
    bill2.isDeleted = false;
    await this.billRepo.save(bill2);

    // Guarantors for Customer 1
    const guar1 = new GuarantorOrmEntity();
    guar1.id = 'guar-apex-001';
    guar1.customerId = cust1.id;
    guar1.companyId = companyId;
    guar1.name = 'Md. Rafiqul Islam';
    guar1.fatherName = 'Late Abdul Karim';
    guar1.motherName = 'Fatema Begum';
    guar1.mobileNumber = '01711223344';
    guar1.nidNumber = '19851122334455667';
    guar1.address = 'House 12, Road 4, Sector 7, Uttara, Dhaka';
    guar1.relationship = 'Brother';
    guar1.createdBy = 'SYSTEM|SEEDER';
    guar1.isActive = true;
    guar1.isDeleted = false;
    await this.guarantorRepo.save(guar1);

    const guar2 = new GuarantorOrmEntity();
    guar2.id = 'guar-apex-002';
    guar2.customerId = cust1.id;
    guar2.companyId = companyId;
    guar2.name = 'Nasreen Akter';
    guar2.fatherName = 'Kawsar Ali';
    guar2.motherName = 'Salma Khatun';
    guar2.mobileNumber = '01822334455';
    guar2.nidNumber = '19902233445566778';
    guar2.address = 'Apt 4B, Green View Tower, Tongi';
    guar2.relationship = 'Business Partner';
    guar2.createdBy = 'SYSTEM|SEEDER';
    guar2.isActive = true;
    guar2.isDeleted = false;
    await this.guarantorRepo.save(guar2);

    // Customer 2
    const cust2 = new CustomerOrmEntity();
    cust2.id = 'cust-apex-002';
    cust2.cId = 2;
    cust2.companyId = companyId;
    cust2.name = 'Shahadat Hossain';
    cust2.fatherName = 'Monir Hossain';
    cust2.motherName = 'Rabeya Khatun';
    cust2.address = 'Plot 18, Road 3, Tongi BSCIC Area';
    cust2.mobileNumber = '01898765432';
    cust2.nidNumber = '19929876543210987';
    cust2.previousUnit = 80.0;
    cust2.advanceMoney = 4500.0;
    cust2.garageId = 'gar-apex-001';
    cust2.createdBy = 'SYSTEM|SEEDER';
    cust2.isActive = true;
    cust2.isDeleted = false;
    await this.customerRepo.save(cust2);

    // Bill 1 for Customer 2: Reading 80 -> 160 (80 units * 15 = 1200)
    // Prev Dues: 4500, Electric: 1200, Rent: 2500, Total: 8200. Paid: 6000. Present Dues: 2200.
    const bill3 = new ElectricBillOrmEntity();
    bill3.id = 'bill-apex-003';
    bill3.billNumber = 3;
    bill3.customerId = cust2.id;
    bill3.companyId = companyId;
    bill3.date = new Date();
    bill3.previousUnit = 80.0;
    bill3.currentUnit = 160.0;
    bill3.totalUnit = 80.0;
    bill3.electricBill = 1200.0;
    bill3.previousDues = 4500.0;
    bill3.rentBill = 2500.0;
    bill3.loan = 0.0;
    bill3.totalBill = 8200.0;
    bill3.clearMoney = 6000.0;
    bill3.presentDues = 2200.0;
    bill3.createdBy = 'SYSTEM|SEEDER';
    bill3.isActive = true;
    bill3.isDeleted = false;
    await this.billRepo.save(bill3);

    // Guarantor for Customer 2
    const guar3 = new GuarantorOrmEntity();
    guar3.id = 'guar-apex-003';
    guar3.customerId = cust2.id;
    guar3.companyId = companyId;
    guar3.name = 'Zakir Hossain';
    guar3.fatherName = 'Monir Hossain';
    guar3.motherName = 'Rabeya Khatun';
    guar3.mobileNumber = '01933445566';
    guar3.nidNumber = '19953344556677889';
    guar3.address = 'Plot 18, Road 3, Tongi BSCIC Area';
    guar3.relationship = 'Uncle';
    guar3.createdBy = 'SYSTEM|SEEDER';
    guar3.isActive = true;
    guar3.isDeleted = false;
    await this.guarantorRepo.save(guar3);

    this.logger.log(`✅ Seeded demo Customers, Electric Bills, and Guarantors for ${companyId}`);
  }

  private async syncDemoGaragesAndPermissions(companyId: string): Promise<void> {
    try {
      // 1. Ensure Garage 2 exists
      let garage2 = await this.garageRepo.findOne({ where: { id: 'gar-apex-002' } });
      if (!garage2) {
        garage2 = new GarageOrmEntity();
        garage2.id = 'gar-apex-002';
        garage2.garageName = 'Apex East Workshop & Battery Hub';
        garage2.address = 'Terminal 4, East Bypass Road, Metro City';
        garage2.companyId = companyId;
        garage2.createdBy = 'SYSTEM|SEEDER';
        garage2.editByName = 'SYSTEM|SEEDER';
        garage2.isActive = true;
        garage2.isDeleted = false;
        await this.garageRepo.save(garage2);
        this.logger.log(`✅ Synced missing Garage 2: ${garage2.garageName}`);
      }

      // 2. Ensure Garage 1 exists
      const garage1 = await this.garageRepo.findOne({ where: { id: 'gar-apex-001' } });

      // 3. Ensure Employee 1 has permissions and only Garage 1 assigned
      const employee = await this.employeeRepo.findOne({
        where: { id: 'emp-apex-001' },
        relations: { permittedGarages: true },
      });
      if (employee && garage1) {
        employee.canCreate = true;
        employee.canEdit = false;
        employee.canDelete = false;
        employee.canView = true;
        employee.permittedGarages = [garage1];
        await this.employeeRepo.save(employee);
        this.logger.log(`✅ Synced demo permissions for employee ${employee.name}`);
      }

      // 4. Ensure Customer 3 in Garage 2 exists
      const cust3 = await this.customerRepo.findOne({ where: { id: 'cust-apex-003' } });
      if (!cust3) {
        const newCust3 = new CustomerOrmEntity();
        newCust3.id = 'cust-apex-003';
        newCust3.cId = 3;
        newCust3.companyId = companyId;
        newCust3.name = 'Anisur Rahman';
        newCust3.fatherName = 'Mokhlesur Rahman';
        newCust3.motherName = 'Anowara Begum';
        newCust3.address = 'Shop 12, Terminal Road, East Bypass';
        newCust3.mobileNumber = '01912345678';
        newCust3.nidNumber = '19889988776655443';
        newCust3.previousUnit = 50.0;
        newCust3.advanceMoney = 6000.0;
        newCust3.garageId = 'gar-apex-002';
        newCust3.createdBy = 'SYSTEM|SEEDER';
        newCust3.isActive = true;
        newCust3.isDeleted = false;
        await this.customerRepo.save(newCust3);

        const bill4 = new ElectricBillOrmEntity();
        bill4.id = 'bill-apex-004';
        bill4.billNumber = 4;
        bill4.customerId = newCust3.id;
        bill4.companyId = companyId;
        bill4.date = new Date();
        bill4.previousUnit = 50.0;
        bill4.currentUnit = 110.0;
        bill4.totalUnit = 60.0;
        bill4.electricBill = 900.0;
        bill4.previousDues = 2000.0;
        bill4.rentBill = 1500.0;
        bill4.loan = 0.0;
        bill4.totalBill = 4400.0;
        bill4.clearMoney = 4400.0;
        bill4.presentDues = 0.0;
        bill4.createdBy = 'SYSTEM|SEEDER';
        bill4.isActive = true;
        bill4.isDeleted = false;
        await this.billRepo.save(bill4);
        this.logger.log(`✅ Synced Customer 3 and Bill 4 in Garage 2`);
      }

      // 5. Ensure demo Guarantors exist
      const existingGuar = await this.guarantorRepo.findOne({ where: { id: 'guar-apex-001' } });
      if (!existingGuar) {
        const cust1 = await this.customerRepo.findOne({ where: { id: 'cust-apex-001' } });
        if (cust1) {
          const guar1 = new GuarantorOrmEntity();
          guar1.id = 'guar-apex-001';
          guar1.customerId = cust1.id;
          guar1.companyId = companyId;
          guar1.name = 'Md. Rafiqul Islam';
          guar1.fatherName = 'Late Abdul Karim';
          guar1.motherName = 'Fatema Begum';
          guar1.mobileNumber = '01711223344';
          guar1.nidNumber = '19851122334455667';
          guar1.address = 'House 12, Road 4, Sector 7, Uttara, Dhaka';
          guar1.relationship = 'Brother';
          guar1.createdBy = 'SYSTEM|SEEDER';
          guar1.isActive = true;
          guar1.isDeleted = false;
          await this.guarantorRepo.save(guar1);

          const guar2 = new GuarantorOrmEntity();
          guar2.id = 'guar-apex-002';
          guar2.customerId = cust1.id;
          guar2.companyId = companyId;
          guar2.name = 'Nasreen Akter';
          guar2.fatherName = 'Kawsar Ali';
          guar2.motherName = 'Salma Khatun';
          guar2.mobileNumber = '01822334455';
          guar2.nidNumber = '19902233445566778';
          guar2.address = 'Apt 4B, Green View Tower, Tongi';
          guar2.relationship = 'Business Partner';
          guar2.createdBy = 'SYSTEM|SEEDER';
          guar2.isActive = true;
          guar2.isDeleted = false;
          await this.guarantorRepo.save(guar2);
          this.logger.log(`✅ Synced demo Guarantors for Customer 1`);
        }

        const cust2 = await this.customerRepo.findOne({ where: { id: 'cust-apex-002' } });
        if (cust2) {
          const guar3 = new GuarantorOrmEntity();
          guar3.id = 'guar-apex-003';
          guar3.customerId = cust2.id;
          guar3.companyId = companyId;
          guar3.name = 'Zakir Hossain';
          guar3.fatherName = 'Monir Hossain';
          guar3.motherName = 'Rabeya Khatun';
          guar3.mobileNumber = '01933445566';
          guar3.nidNumber = '19953344556677889';
          guar3.address = 'Plot 18, Road 3, Tongi BSCIC Area';
          guar3.relationship = 'Uncle';
          guar3.createdBy = 'SYSTEM|SEEDER';
          guar3.isActive = true;
          guar3.isDeleted = false;
          await this.guarantorRepo.save(guar3);
          this.logger.log(`✅ Synced demo Guarantor for Customer 2`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed during syncDemoGaragesAndPermissions: ${err.message}`);
    }
  }
}
