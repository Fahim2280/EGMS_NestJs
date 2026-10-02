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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_employee_command_1 = require("../impl/update-employee.command");
const index_1 = require("../../../domain/index");
let UpdateEmployeeHandler = class UpdateEmployeeHandler {
    employeeRepo;
    constructor(employeeRepo) {
        this.employeeRepo = employeeRepo;
    }
    async execute(command) {
        const { id, companyId, name, address, phoneNumber, nidNumber, updatedByStamp, phoneNumbers, documents } = command;
        const employee = await this.employeeRepo.findById(id);
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID '${id}' not found.`);
        }
        if (employee.companyId !== companyId) {
            throw new common_1.ForbiddenException('You do not have permission to edit this employee.');
        }
        employee.updateDetails(name, address, phoneNumber, nidNumber, updatedByStamp, phoneNumbers);
        if (documents !== undefined) {
            employee.setDocuments(documents);
        }
        await this.employeeRepo.save(employee);
    }
};
exports.UpdateEmployeeHandler = UpdateEmployeeHandler;
exports.UpdateEmployeeHandler = UpdateEmployeeHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_employee_command_1.UpdateEmployeeCommand),
    __param(0, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], UpdateEmployeeHandler);
//# sourceMappingURL=update-employee.handler.js.map