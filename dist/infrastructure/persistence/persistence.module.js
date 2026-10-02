"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const index_1 = require("../../domain/index");
const company_orm_entity_1 = require("./typeorm/entities/company.orm-entity");
const garage_orm_entity_1 = require("./typeorm/entities/garage.orm-entity");
const employee_orm_entity_1 = require("./typeorm/entities/employee.orm-entity");
const customer_orm_entity_1 = require("./typeorm/entities/customer.orm-entity");
const electric_bill_orm_entity_1 = require("./typeorm/entities/electric-bill.orm-entity");
const guarantor_orm_entity_1 = require("./typeorm/entities/guarantor.orm-entity");
const password_reset_token_orm_entity_1 = require("./typeorm/entities/password-reset-token.orm-entity");
const audit_log_orm_entity_1 = require("./typeorm/entities/audit-log.orm-entity");
const company_approval_token_orm_entity_1 = require("./typeorm/entities/company-approval-token.orm-entity");
const typeorm_company_repository_1 = require("./typeorm/repositories/typeorm-company.repository");
const typeorm_garage_repository_1 = require("./typeorm/repositories/typeorm-garage.repository");
const typeorm_employee_repository_1 = require("./typeorm/repositories/typeorm-employee.repository");
const typeorm_customer_repository_1 = require("./typeorm/repositories/typeorm-customer.repository");
const typeorm_electric_bill_repository_1 = require("./typeorm/repositories/typeorm-electric-bill.repository");
const typeorm_guarantor_repository_1 = require("./typeorm/repositories/typeorm-guarantor.repository");
const typeorm_password_reset_token_repository_1 = require("./typeorm/repositories/typeorm-password-reset-token.repository");
const typeorm_audit_log_repository_1 = require("./typeorm/repositories/typeorm-audit-log.repository");
const typeorm_company_approval_token_repository_1 = require("./typeorm/repositories/typeorm-company-approval-token.repository");
const database_seeder_service_1 = require("./typeorm/database-seeder.service");
let PersistenceModule = class PersistenceModule {
};
exports.PersistenceModule = PersistenceModule;
exports.PersistenceModule = PersistenceModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    type: 'mysql',
                    host: config.get('DB_HOST', '127.0.0.1'),
                    port: config.get('DB_PORT', 3306),
                    username: config.get('DB_USERNAME', 'root'),
                    password: config.get('DB_PASSWORD', 'pandaKnight009'),
                    database: config.get('DB_DATABASE', 'egms_db'),
                    entities: [
                        company_orm_entity_1.CompanyOrmEntity,
                        garage_orm_entity_1.GarageOrmEntity,
                        employee_orm_entity_1.EmployeeOrmEntity,
                        customer_orm_entity_1.CustomerOrmEntity,
                        electric_bill_orm_entity_1.ElectricBillOrmEntity,
                        guarantor_orm_entity_1.GuarantorOrmEntity,
                        password_reset_token_orm_entity_1.PasswordResetTokenOrmEntity,
                        audit_log_orm_entity_1.AuditLogOrmEntity,
                        company_approval_token_orm_entity_1.CompanyApprovalTokenOrmEntity,
                    ],
                    synchronize: config.get('NODE_ENV') !== 'production' &&
                        config.get('DB_SYNCHRONIZE', 'true') === 'true',
                    logging: config.get('DB_LOGGING', 'false') === 'true',
                    extra: {
                        connectionLimit: Number(config.get('DB_CONNECTION_LIMIT', 10)),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([
                company_orm_entity_1.CompanyOrmEntity,
                garage_orm_entity_1.GarageOrmEntity,
                employee_orm_entity_1.EmployeeOrmEntity,
                customer_orm_entity_1.CustomerOrmEntity,
                electric_bill_orm_entity_1.ElectricBillOrmEntity,
                guarantor_orm_entity_1.GuarantorOrmEntity,
                password_reset_token_orm_entity_1.PasswordResetTokenOrmEntity,
                audit_log_orm_entity_1.AuditLogOrmEntity,
                company_approval_token_orm_entity_1.CompanyApprovalTokenOrmEntity,
            ]),
        ],
        providers: [
            typeorm_company_repository_1.TypeOrmCompanyRepository,
            typeorm_garage_repository_1.TypeOrmGarageRepository,
            typeorm_employee_repository_1.TypeOrmEmployeeRepository,
            typeorm_customer_repository_1.TypeOrmCustomerRepository,
            typeorm_electric_bill_repository_1.TypeOrmElectricBillRepository,
            typeorm_guarantor_repository_1.TypeOrmGuarantorRepository,
            typeorm_password_reset_token_repository_1.TypeOrmPasswordResetTokenRepository,
            typeorm_audit_log_repository_1.TypeOrmAuditLogRepository,
            typeorm_company_approval_token_repository_1.TypeOrmCompanyApprovalTokenRepository,
            database_seeder_service_1.DatabaseSeederService,
            {
                provide: index_1.COMPANY_REPOSITORY_TOKEN,
                useExisting: typeorm_company_repository_1.TypeOrmCompanyRepository,
            },
            {
                provide: index_1.GARAGE_REPOSITORY_TOKEN,
                useExisting: typeorm_garage_repository_1.TypeOrmGarageRepository,
            },
            {
                provide: index_1.EMPLOYEE_REPOSITORY_TOKEN,
                useExisting: typeorm_employee_repository_1.TypeOrmEmployeeRepository,
            },
            {
                provide: index_1.CUSTOMER_REPOSITORY_TOKEN,
                useExisting: typeorm_customer_repository_1.TypeOrmCustomerRepository,
            },
            {
                provide: index_1.ELECTRIC_BILL_REPOSITORY_TOKEN,
                useExisting: typeorm_electric_bill_repository_1.TypeOrmElectricBillRepository,
            },
            {
                provide: index_1.GUARANTOR_REPOSITORY_TOKEN,
                useExisting: typeorm_guarantor_repository_1.TypeOrmGuarantorRepository,
            },
            {
                provide: index_1.PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
                useExisting: typeorm_password_reset_token_repository_1.TypeOrmPasswordResetTokenRepository,
            },
            {
                provide: index_1.AUDIT_LOG_REPOSITORY_TOKEN,
                useExisting: typeorm_audit_log_repository_1.TypeOrmAuditLogRepository,
            },
            {
                provide: index_1.COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN,
                useExisting: typeorm_company_approval_token_repository_1.TypeOrmCompanyApprovalTokenRepository,
            },
        ],
        exports: [
            typeorm_1.TypeOrmModule,
            index_1.COMPANY_REPOSITORY_TOKEN,
            index_1.GARAGE_REPOSITORY_TOKEN,
            index_1.EMPLOYEE_REPOSITORY_TOKEN,
            index_1.CUSTOMER_REPOSITORY_TOKEN,
            index_1.ELECTRIC_BILL_REPOSITORY_TOKEN,
            index_1.GUARANTOR_REPOSITORY_TOKEN,
            index_1.PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
            index_1.AUDIT_LOG_REPOSITORY_TOKEN,
            index_1.COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN,
        ],
    })
], PersistenceModule);
//# sourceMappingURL=persistence.module.js.map