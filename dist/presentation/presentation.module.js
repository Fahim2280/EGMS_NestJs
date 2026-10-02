"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentationModule = void 0;
const common_1 = require("@nestjs/common");
const application_module_1 = require("../application/application.module");
const auth_controller_1 = require("./controllers/auth.controller");
const dashboard_controller_1 = require("./controllers/dashboard.controller");
const garage_controller_1 = require("./controllers/garage.controller");
const employee_controller_1 = require("./controllers/employee.controller");
const customer_controller_1 = require("./controllers/customer.controller");
const electric_bill_controller_1 = require("./controllers/electric-bill.controller");
const audit_log_controller_1 = require("./controllers/audit-log.controller");
const error_controller_1 = require("./controllers/error.controller");
const file_controller_1 = require("./controllers/file.controller");
let PresentationModule = class PresentationModule {
};
exports.PresentationModule = PresentationModule;
exports.PresentationModule = PresentationModule = __decorate([
    (0, common_1.Module)({
        imports: [application_module_1.ApplicationModule],
        controllers: [
            auth_controller_1.AuthController,
            dashboard_controller_1.DashboardController,
            garage_controller_1.GarageController,
            employee_controller_1.EmployeeController,
            customer_controller_1.CustomerController,
            electric_bill_controller_1.ElectricBillController,
            audit_log_controller_1.AuditLogController,
            error_controller_1.ErrorController,
            file_controller_1.FileController,
        ],
    })
], PresentationModule);
//# sourceMappingURL=presentation.module.js.map