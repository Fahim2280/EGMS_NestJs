"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const nestjs_1 = require("@automapper/nestjs");
const classes_1 = require("@automapper/classes");
const billing_calculation_service_1 = require("./services/billing-calculation.service");
const audit_log_service_1 = require("./services/audit-log.service");
const file_service_1 = require("../infrastructure/services/file.service");
const register_company_handler_1 = require("./commands/handlers/register-company.handler");
const create_garage_handler_1 = require("./commands/handlers/create-garage.handler");
const update_garage_handler_1 = require("./commands/handlers/update-garage.handler");
const toggle_garage_status_handler_1 = require("./commands/handlers/toggle-garage-status.handler");
const create_employee_handler_1 = require("./commands/handlers/create-employee.handler");
const update_employee_handler_1 = require("./commands/handlers/update-employee.handler");
const delete_employee_handler_1 = require("./commands/handlers/delete-employee.handler");
const login_handler_1 = require("./commands/handlers/login.handler");
const create_customer_handler_1 = require("./commands/handlers/create-customer.handler");
const update_customer_handler_1 = require("./commands/handlers/update-customer.handler");
const delete_customer_handler_1 = require("./commands/handlers/delete-customer.handler");
const toggle_customer_status_handler_1 = require("./commands/handlers/toggle-customer-status.handler");
const create_electric_bill_handler_1 = require("./commands/handlers/create-electric-bill.handler");
const update_electric_bill_handler_1 = require("./commands/handlers/update-electric-bill.handler");
const delete_electric_bill_handler_1 = require("./commands/handlers/delete-electric-bill.handler");
const generate_monthly_bills_handler_1 = require("./commands/handlers/generate-monthly-bills.handler");
const forgot_password_handler_1 = require("./commands/handlers/forgot-password.handler");
const reset_password_handler_1 = require("./commands/handlers/reset-password.handler");
const update_company_handler_1 = require("./commands/handlers/update-company.handler");
const update_employee_permission_handler_1 = require("./commands/handlers/update-employee-permission.handler");
const approve_company_handler_1 = require("./commands/handlers/approve-company.handler");
const reject_company_handler_1 = require("./commands/handlers/reject-company.handler");
const create_guarantor_handler_1 = require("./commands/handlers/create-guarantor.handler");
const update_guarantor_handler_1 = require("./commands/handlers/update-guarantor.handler");
const delete_guarantor_handler_1 = require("./commands/handlers/delete-guarantor.handler");
const create_employee_guarantor_handler_1 = require("./commands/handlers/create-employee-guarantor.handler");
const update_employee_guarantor_handler_1 = require("./commands/handlers/update-employee-guarantor.handler");
const delete_employee_guarantor_handler_1 = require("./commands/handlers/delete-employee-guarantor.handler");
const get_company_by_id_handler_1 = require("./queries/handlers/get-company-by-id.handler");
const get_garages_by_company_handler_1 = require("./queries/handlers/get-garages-by-company.handler");
const get_garage_by_id_handler_1 = require("./queries/handlers/get-garage-by-id.handler");
const get_garage_dashboard_handler_1 = require("./queries/handlers/get-garage-dashboard.handler");
const get_employees_by_company_handler_1 = require("./queries/handlers/get-employees-by-company.handler");
const get_employee_by_id_handler_1 = require("./queries/handlers/get-employee-by-id.handler");
const get_dashboard_stats_handler_1 = require("./queries/handlers/get-dashboard-stats.handler");
const get_customers_by_company_handler_1 = require("./queries/handlers/get-customers-by-company.handler");
const get_customer_by_id_handler_1 = require("./queries/handlers/get-customer-by-id.handler");
const get_electric_bills_by_company_handler_1 = require("./queries/handlers/get-electric-bills-by-company.handler");
const get_electric_bill_by_id_handler_1 = require("./queries/handlers/get-electric-bill-by-id.handler");
const get_customer_bill_summary_handler_1 = require("./queries/handlers/get-customer-bill-summary.handler");
const preview_electric_bill_handler_1 = require("./queries/handlers/preview-electric-bill.handler");
const get_executive_dashboard_handler_1 = require("./queries/handlers/get-executive-dashboard.handler");
const get_guarantors_by_customer_handler_1 = require("./queries/handlers/get-guarantors-by-customer.handler");
const get_guarantors_by_employee_handler_1 = require("./queries/handlers/get-guarantors-by-employee.handler");
const get_audit_logs_handler_1 = require("./queries/handlers/get-audit-logs.handler");
const company_profile_1 = require("./mappings/company.profile");
const garage_profile_1 = require("./mappings/garage.profile");
const employee_profile_1 = require("./mappings/employee.profile");
const CommandHandlers = [
    register_company_handler_1.RegisterCompanyHandler,
    create_garage_handler_1.CreateGarageHandler,
    update_garage_handler_1.UpdateGarageHandler,
    toggle_garage_status_handler_1.ToggleGarageStatusHandler,
    create_employee_handler_1.CreateEmployeeHandler,
    update_employee_handler_1.UpdateEmployeeHandler,
    delete_employee_handler_1.DeleteEmployeeHandler,
    login_handler_1.LoginHandler,
    create_customer_handler_1.CreateCustomerHandler,
    update_customer_handler_1.UpdateCustomerHandler,
    delete_customer_handler_1.DeleteCustomerHandler,
    toggle_customer_status_handler_1.ToggleCustomerStatusHandler,
    create_electric_bill_handler_1.CreateElectricBillHandler,
    update_electric_bill_handler_1.UpdateElectricBillHandler,
    delete_electric_bill_handler_1.DeleteElectricBillHandler,
    generate_monthly_bills_handler_1.GenerateMonthlyBillsHandler,
    forgot_password_handler_1.ForgotPasswordHandler,
    reset_password_handler_1.ResetPasswordHandler,
    update_company_handler_1.UpdateCompanyHandler,
    update_employee_permission_handler_1.UpdateEmployeePermissionHandler,
    approve_company_handler_1.ApproveCompanyHandler,
    reject_company_handler_1.RejectCompanyHandler,
    create_guarantor_handler_1.CreateGuarantorHandler,
    update_guarantor_handler_1.UpdateGuarantorHandler,
    delete_guarantor_handler_1.DeleteGuarantorHandler,
    create_employee_guarantor_handler_1.CreateEmployeeGuarantorHandler,
    update_employee_guarantor_handler_1.UpdateEmployeeGuarantorHandler,
    delete_employee_guarantor_handler_1.DeleteEmployeeGuarantorHandler,
];
const QueryHandlers = [
    get_company_by_id_handler_1.GetCompanyByIdHandler,
    get_garages_by_company_handler_1.GetGaragesByCompanyHandler,
    get_garage_by_id_handler_1.GetGarageByIdHandler,
    get_garage_dashboard_handler_1.GetGarageDashboardHandler,
    get_employees_by_company_handler_1.GetEmployeesByCompanyHandler,
    get_employee_by_id_handler_1.GetEmployeeByIdHandler,
    get_dashboard_stats_handler_1.GetDashboardStatsHandler,
    get_customers_by_company_handler_1.GetCustomersByCompanyHandler,
    get_customer_by_id_handler_1.GetCustomerByIdHandler,
    get_electric_bills_by_company_handler_1.GetElectricBillsByCompanyHandler,
    get_electric_bill_by_id_handler_1.GetElectricBillByIdHandler,
    get_customer_bill_summary_handler_1.GetCustomerBillSummaryHandler,
    preview_electric_bill_handler_1.PreviewElectricBillHandler,
    get_executive_dashboard_handler_1.GetExecutiveDashboardHandler,
    get_guarantors_by_customer_handler_1.GetGuarantorsByCustomerHandler,
    get_guarantors_by_employee_handler_1.GetGuarantorsByEmployeeHandler,
    get_audit_logs_handler_1.GetAuditLogsHandler,
];
const Profiles = [
    company_profile_1.CompanyProfile,
    garage_profile_1.GarageProfile,
    employee_profile_1.EmployeeProfile,
];
let ApplicationModule = class ApplicationModule {
};
exports.ApplicationModule = ApplicationModule;
exports.ApplicationModule = ApplicationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            nestjs_1.AutomapperModule.forRoot({
                strategyInitializer: (0, classes_1.classes)(),
            }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET', 'super_secret_jwt_egms_key_2026_enterprise_secure!'),
                    signOptions: {
                        expiresIn: (configService.get('JWT_EXPIRES_IN', '7d')),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [
            billing_calculation_service_1.BillingCalculationService,
            audit_log_service_1.AuditLogService,
            file_service_1.FileService,
            ...CommandHandlers,
            ...QueryHandlers,
            ...Profiles,
        ],
        exports: [cqrs_1.CqrsModule, jwt_1.JwtModule, nestjs_1.AutomapperModule, billing_calculation_service_1.BillingCalculationService, audit_log_service_1.AuditLogService, file_service_1.FileService],
    })
], ApplicationModule);
//# sourceMappingURL=application.module.js.map