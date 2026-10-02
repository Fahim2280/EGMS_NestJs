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
exports.GetCompanyByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@automapper/nestjs");
const get_company_by_id_query_1 = require("../impl/get-company-by-id.query");
const index_1 = require("../../../domain/index");
const company_dto_1 = require("../../dtos/company.dto");
let GetCompanyByIdHandler = class GetCompanyByIdHandler {
    companyRepo;
    garageRepo;
    employeeRepo;
    mapper;
    constructor(companyRepo, garageRepo, employeeRepo, mapper) {
        this.companyRepo = companyRepo;
        this.garageRepo = garageRepo;
        this.employeeRepo = employeeRepo;
        this.mapper = mapper;
    }
    async execute(query) {
        const company = await this.companyRepo.findById(query.id);
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID '${query.id}' was not found.`);
        }
        const dto = this.mapper.map(company, index_1.Company, company_dto_1.CompanyResponseDto);
        dto.garages = await this.garageRepo.findByCompanyId(company.id);
        dto.employeeCount = await this.employeeRepo.countByCompanyId(company.id);
        return dto;
    }
};
exports.GetCompanyByIdHandler = GetCompanyByIdHandler;
exports.GetCompanyByIdHandler = GetCompanyByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_company_by_id_query_1.GetCompanyByIdQuery),
    __param(0, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __param(3, (0, nestjs_1.InjectMapper)()),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GetCompanyByIdHandler);
//# sourceMappingURL=get-company-by-id.handler.js.map