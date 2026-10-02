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
exports.UpdateEmployeePermissionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_employee_permission_command_1 = require("../impl/update-employee-permission.command");
const index_1 = require("../../../domain/index");
let UpdateEmployeePermissionHandler = class UpdateEmployeePermissionHandler {
    employeeRepo;
    garageRepo;
    constructor(employeeRepo, garageRepo) {
        this.employeeRepo = employeeRepo;
        this.garageRepo = garageRepo;
    }
    async execute(command) {
        const { employeeId, companyId, role, isActive, canCreate, canEdit, canDelete, canView, garageIds, updatedByStamp, } = command;
        const employee = await this.employeeRepo.findById(employeeId);
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID '${employeeId}' was not found.`);
        }
        if (employee.companyId !== companyId) {
            throw new common_1.ForbiddenException('You do not have administrative permission to modify permissions for this employee.');
        }
        const allowedRoles = ['SUPER_ADMIN', 'GENERAL'];
        if (!allowedRoles.includes(role)) {
            throw new common_1.BadRequestException(`Invalid role '${role}'. Valid roles are: ${allowedRoles.join(', ')}`);
        }
        const validGarageIds = [];
        if (garageIds && Array.isArray(garageIds) && garageIds.length > 0) {
            const companyGarages = await this.garageRepo.findByCompanyId(companyId);
            const companyGarageIdSet = new Set(companyGarages.map((g) => g.id));
            for (const gid of garageIds) {
                if (gid && companyGarageIdSet.has(gid)) {
                    validGarageIds.push(gid);
                }
            }
        }
        employee.updateRole(role, updatedByStamp);
        employee.updatePermissions(role === 'SUPER_ADMIN' ? true : Boolean(canCreate), role === 'SUPER_ADMIN' ? true : Boolean(canEdit), role === 'SUPER_ADMIN' ? true : Boolean(canDelete), role === 'SUPER_ADMIN' ? true : Boolean(canView), validGarageIds, updatedByStamp);
        if (isActive) {
            employee.activate(updatedByStamp);
        }
        else {
            employee.deactivate(updatedByStamp);
        }
        await this.employeeRepo.saveWithGarages(employee, validGarageIds);
    }
};
exports.UpdateEmployeePermissionHandler = UpdateEmployeePermissionHandler;
exports.UpdateEmployeePermissionHandler = UpdateEmployeePermissionHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_employee_permission_command_1.UpdateEmployeePermissionCommand),
    __param(0, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateEmployeePermissionHandler);
//# sourceMappingURL=update-employee-permission.handler.js.map