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
exports.GetEmployeeByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_employee_by_id_query_1 = require("../impl/get-employee-by-id.query");
const index_1 = require("../../../domain/index");
let GetEmployeeByIdHandler = class GetEmployeeByIdHandler {
    employeeRepo;
    constructor(employeeRepo) {
        this.employeeRepo = employeeRepo;
    }
    async execute(query) {
        const { id, companyId } = query;
        const employee = await this.employeeRepo.findById(id);
        if (!employee || employee.companyId !== companyId || employee.isDeleted) {
            throw new common_1.NotFoundException(`Employee not found.`);
        }
        return employee;
    }
};
exports.GetEmployeeByIdHandler = GetEmployeeByIdHandler;
exports.GetEmployeeByIdHandler = GetEmployeeByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_employee_by_id_query_1.GetEmployeeByIdQuery),
    __param(0, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], GetEmployeeByIdHandler);
//# sourceMappingURL=get-employee-by-id.handler.js.map