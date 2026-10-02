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
exports.GetEmployeesByCompanyHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@automapper/nestjs");
const get_employees_by_company_query_1 = require("../impl/get-employees-by-company.query");
const index_1 = require("../../../domain/index");
const employee_dto_1 = require("../../dtos/employee.dto");
let GetEmployeesByCompanyHandler = class GetEmployeesByCompanyHandler {
    employeeRepo;
    companyRepo;
    mapper;
    constructor(employeeRepo, companyRepo, mapper) {
        this.employeeRepo = employeeRepo;
        this.companyRepo = companyRepo;
        this.mapper = mapper;
    }
    async execute(query) {
        const employees = await this.employeeRepo.findByCompanyId(query.companyId);
        const company = await this.companyRepo.findById(query.companyId);
        return employees.map((emp) => {
            const dto = this.mapper.map(emp, index_1.Employee, employee_dto_1.EmployeeResponseDto);
            dto.companyName = company?.companyName;
            dto.phoneNumbers = emp.phoneNumbers;
            dto.documents = emp.documents;
            return dto;
        });
    }
};
exports.GetEmployeesByCompanyHandler = GetEmployeesByCompanyHandler;
exports.GetEmployeesByCompanyHandler = GetEmployeesByCompanyHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_employees_by_company_query_1.GetEmployeesByCompanyQuery),
    __param(0, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(2, (0, nestjs_1.InjectMapper)()),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetEmployeesByCompanyHandler);
//# sourceMappingURL=get-employees-by-company.handler.js.map