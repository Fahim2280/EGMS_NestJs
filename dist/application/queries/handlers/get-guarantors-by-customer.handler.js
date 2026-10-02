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
exports.GetGuarantorsByCustomerHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_guarantors_by_customer_query_1 = require("../impl/get-guarantors-by-customer.query");
const index_1 = require("../../../domain/index");
let GetGuarantorsByCustomerHandler = class GetGuarantorsByCustomerHandler {
    guarantorRepo;
    constructor(guarantorRepo) {
        this.guarantorRepo = guarantorRepo;
    }
    async execute(query) {
        const list = await this.guarantorRepo.findByCustomerId(query.customerId);
        return list
            .filter((g) => g.companyId === query.companyId)
            .map((g) => ({
            id: g.id,
            customerId: g.customerId,
            companyId: g.companyId,
            name: g.name,
            fatherName: g.fatherName,
            motherName: g.motherName,
            address: g.address,
            mobileNumber: g.mobileNumber,
            phoneNumbers: g.phoneNumbers,
            documents: g.documents || [],
            nidNumber: g.nidNumber,
            relationship: g.relationship,
            createdDate: g.createdDate,
        }));
    }
};
exports.GetGuarantorsByCustomerHandler = GetGuarantorsByCustomerHandler;
exports.GetGuarantorsByCustomerHandler = GetGuarantorsByCustomerHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_guarantors_by_customer_query_1.GetGuarantorsByCustomerQuery),
    __param(0, (0, common_1.Inject)(index_1.GUARANTOR_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], GetGuarantorsByCustomerHandler);
//# sourceMappingURL=get-guarantors-by-customer.handler.js.map