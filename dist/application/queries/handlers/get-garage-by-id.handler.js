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
exports.GetGarageByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@automapper/nestjs");
const get_garage_by_id_query_1 = require("../impl/get-garage-by-id.query");
const index_1 = require("../../../domain/index");
const garage_dto_1 = require("../../dtos/garage.dto");
let GetGarageByIdHandler = class GetGarageByIdHandler {
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
        const { id, companyId } = query;
        const garage = await this.garageRepo.getByIdAsync(id);
        if (!garage || garage.companyId !== companyId) {
            throw new common_1.NotFoundException(`Garage with ID '${id}' was not found.`);
        }
        const company = await this.companyRepo.findById(companyId);
        const customerCount = await this.customerRepo.countByGarageId(companyId, id);
        const dto = this.mapper.map(garage, index_1.Garage, garage_dto_1.GarageResponseDto);
        dto.companyName = company?.companyName;
        dto.customerCount = customerCount;
        return dto;
    }
};
exports.GetGarageByIdHandler = GetGarageByIdHandler;
exports.GetGarageByIdHandler = GetGarageByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_garage_by_id_query_1.GetGarageByIdQuery),
    __param(0, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(3, (0, nestjs_1.InjectMapper)()),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GetGarageByIdHandler);
//# sourceMappingURL=get-garage-by-id.handler.js.map