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
exports.GetGaragesByCompanyHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@automapper/nestjs");
const get_garages_by_company_query_1 = require("../impl/get-garages-by-company.query");
const index_1 = require("../../../domain/index");
const garage_dto_1 = require("../../dtos/garage.dto");
let GetGaragesByCompanyHandler = class GetGaragesByCompanyHandler {
    garageRepo;
    companyRepo;
    customerRepo;
    mapper;
    constructor(garageRepo, companyRepo, customerRepo, mapper) {
        this.garageRepo = garageRepo;
        this.companyRepo = companyRepo;
        this.customerRepo = customerRepo;
        this.mapper = mapper;
    }
    async execute(query) {
        let garages = await this.garageRepo.findByCompanyId(query.companyId);
        if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
            const allowedSet = new Set(query.allowedGarageIds);
            garages = garages.filter((g) => allowedSet.has(g.id));
        }
        const company = await this.companyRepo.findById(query.companyId);
        const results = await Promise.all(garages.map(async (g) => {
            const dto = this.mapper.map(g, index_1.Garage, garage_dto_1.GarageResponseDto);
            dto.companyName = company?.companyName;
            dto.customerCount = await this.customerRepo.countByGarageId(query.companyId, g.id);
            return dto;
        }));
        return results;
    }
};
exports.GetGaragesByCompanyHandler = GetGaragesByCompanyHandler;
exports.GetGaragesByCompanyHandler = GetGaragesByCompanyHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_garages_by_company_query_1.GetGaragesByCompanyQuery),
    __param(0, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(3, (0, nestjs_1.InjectMapper)()),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GetGaragesByCompanyHandler);
//# sourceMappingURL=get-garages-by-company.handler.js.map