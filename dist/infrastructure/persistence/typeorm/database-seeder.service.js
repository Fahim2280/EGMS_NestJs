"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DatabaseSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const company_orm_entity_1 = require("./entities/company.orm-entity");
const garage_orm_entity_1 = require("./entities/garage.orm-entity");
const employee_orm_entity_1 = require("./entities/employee.orm-entity");
const customer_orm_entity_1 = require("./entities/customer.orm-entity");
const electric_bill_orm_entity_1 = require("./entities/electric-bill.orm-entity");
const guarantor_orm_entity_1 = require("./entities/guarantor.orm-entity");
let DatabaseSeederService = DatabaseSeederService_1 = class DatabaseSeederService {
    companyRepo;
    garageRepo;
    employeeRepo;
    customerRepo;
    billRepo;
    guarantorRepo;
    logger = new common_1.Logger(DatabaseSeederService_1.name);
    constructor(companyRepo, garageRepo, employeeRepo, customerRepo, billRepo, guarantorRepo) {
        this.companyRepo = companyRepo;
        this.garageRepo = garageRepo;
        this.employeeRepo = employeeRepo;
        this.customerRepo = customerRepo;
        this.billRepo = billRepo;
        this.guarantorRepo = guarantorRepo;
    }
    async onApplicationBootstrap() {
        await this.seed();
    }
    async seed() {
        try {
            const isProd = process.env.NODE_ENV === 'production';
            const allowSeed = process.env.ALLOW_SEED === 'true';
            if (isProd && !allowSeed) {
                this.logger.log('🔒 Production mode: Skipping automatic demo database seeding (ALLOW_SEED=false).');
                return;
            }
            const companyCount = await this.companyRepo.count();
            if (companyCount > 0) {
                await this.seedCustomersAndBills('comp-apex-001');
                return;
            }
            this.logger.log('🌱 Seeding initial demo Company, Garages, Employee, Customers & Electric Bills...');
            const salt = await bcrypt.genSalt(10);
            const companyPassword = await bcrypt.hash('Admin@123', salt);
            const company = new company_orm_entity_1.CompanyOrmEntity();
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
            const garage1 = new garage_orm_entity_1.GarageOrmEntity();
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
            const garage2 = new garage_orm_entity_1.GarageOrmEntity();
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
            const employeePassword = await bcrypt.hash('Employee@123', salt);
            const employee = new employee_orm_entity_1.EmployeeOrmEntity();
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
            await this.seedCustomersAndBills(company.id);
            await this.syncDemoGaragesAndPermissions(company.id);
        }
        catch (error) {
            this.logger.error(`Failed to seed database: ${error.message}`, error.stack);
        }
    }
    async seedCustomersAndBills(companyId) {
        const custCount = await this.customerRepo.count({ where: { companyId } });
        if (custCount > 0)
            return;
        const cust1 = new customer_orm_entity_1.CustomerOrmEntity();
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
        const bill1 = new electric_bill_orm_entity_1.ElectricBillOrmEntity();
        bill1.id = 'bill-apex-001';
        bill1.billNumber = 1;
        bill1.customerId = cust1.id;
        bill1.companyId = companyId;
        bill1.date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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
        const bill2 = new electric_bill_orm_entity_1.ElectricBillOrmEntity();
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
        const guar1 = new guarantor_orm_entity_1.GuarantorOrmEntity();
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
        const guar2 = new guarantor_orm_entity_1.GuarantorOrmEntity();
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
        const cust2 = new customer_orm_entity_1.CustomerOrmEntity();
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
        const bill3 = new electric_bill_orm_entity_1.ElectricBillOrmEntity();
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
        const guar3 = new guarantor_orm_entity_1.GuarantorOrmEntity();
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
    async syncDemoGaragesAndPermissions(companyId) {
        try {
            let garage2 = await this.garageRepo.findOne({ where: { id: 'gar-apex-002' } });
            if (!garage2) {
                garage2 = new garage_orm_entity_1.GarageOrmEntity();
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
            const garage1 = await this.garageRepo.findOne({ where: { id: 'gar-apex-001' } });
            const employee = await this.employeeRepo.findOne({
                where: { id: 'emp-apex-001' },
                relations: { permittedGarages: true },
            });
            if (employee && (!employee.permittedGarages || employee.permittedGarages.length === 0) && garage1) {
                employee.canCreate = true;
                employee.canEdit = false;
                employee.canDelete = false;
                employee.canView = true;
                employee.permittedGarages = [garage1];
                await this.employeeRepo.save(employee);
                this.logger.log(`✅ Initialized demo permissions for employee ${employee.name}`);
            }
            const cust3 = await this.customerRepo.findOne({ where: { id: 'cust-apex-003' } });
            if (!cust3) {
                const newCust3 = new customer_orm_entity_1.CustomerOrmEntity();
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
                const bill4 = new electric_bill_orm_entity_1.ElectricBillOrmEntity();
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
            const existingGuar = await this.guarantorRepo.findOne({ where: { id: 'guar-apex-001' } });
            if (!existingGuar) {
                const cust1 = await this.customerRepo.findOne({ where: { id: 'cust-apex-001' } });
                if (cust1) {
                    const guar1 = new guarantor_orm_entity_1.GuarantorOrmEntity();
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
                    const guar2 = new guarantor_orm_entity_1.GuarantorOrmEntity();
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
                    const guar3 = new guarantor_orm_entity_1.GuarantorOrmEntity();
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
        }
        catch (err) {
            this.logger.warn(`Failed during syncDemoGaragesAndPermissions: ${err.message}`);
        }
    }
};
exports.DatabaseSeederService = DatabaseSeederService;
exports.DatabaseSeederService = DatabaseSeederService = DatabaseSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(garage_orm_entity_1.GarageOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_orm_entity_1.EmployeeOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_orm_entity_1.CustomerOrmEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(electric_bill_orm_entity_1.ElectricBillOrmEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(guarantor_orm_entity_1.GuarantorOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DatabaseSeederService);
//# sourceMappingURL=database-seeder.service.js.map