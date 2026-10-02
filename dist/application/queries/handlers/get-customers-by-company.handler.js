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
exports.GetCustomersByCompanyHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_customers_by_company_query_1 = require("../impl/get-customers-by-company.query");
const index_1 = require("../../../domain/index");
let GetCustomersByCompanyHandler = class GetCustomersByCompanyHandler {
    customerRepo;
    garageRepo;
    constructor(customerRepo, garageRepo) {
        this.customerRepo = customerRepo;
        this.garageRepo = garageRepo;
    }
    async execute(query) {
        const [rawCustomers, garages] = await Promise.all([
            this.customerRepo.findByCompanyId(query.companyId),
            this.garageRepo ? this.garageRepo.findByCompanyId(query.companyId) : Promise.resolve([]),
        ]);
        let customers = rawCustomers;
        if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
            const allowedSet = new Set(query.allowedGarageIds);
            customers = customers.filter((c) => c.garageId && allowedSet.has(c.garageId));
        }
        const garageMap = new Map((garages || []).map((g) => [g.id, g]));
        return customers.map((c) => ({
            id: c.id,
            cId: c.cId,
            customerCode: c.customerCode,
            companyId: c.companyId,
            name: c.name,
            fatherName: c.fatherName,
            motherName: c.motherName,
            address: c.address,
            mobileNumber: c.mobileNumber,
            phoneNumbers: c.phoneNumbers,
            documents: c.documents,
            nidNumber: c.nidNumber,
            previousUnit: c.previousUnit,
            advanceMoney: c.advanceMoney,
            garageId: c.garageId,
            garageName: c.garageName || (c.garageId ? garageMap.get(c.garageId)?.garageName : undefined),
            isActive: c.isActive,
            isGarageSuspended: c.garageId ? (garageMap.get(c.garageId)?.isActive === false) : false,
            createdDate: c.createdDate,
        }));
    }
};
exports.GetCustomersByCompanyHandler = GetCustomersByCompanyHandler;
exports.GetCustomersByCompanyHandler = GetCustomersByCompanyHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_customers_by_company_query_1.GetCustomersByCompanyQuery),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], GetCustomersByCompanyHandler);
//# sourceMappingURL=get-customers-by-company.handler.js.map