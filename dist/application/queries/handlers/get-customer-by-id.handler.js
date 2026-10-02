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
exports.GetCustomerByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_customer_by_id_query_1 = require("../impl/get-customer-by-id.query");
const index_1 = require("../../../domain/index");
let GetCustomerByIdHandler = class GetCustomerByIdHandler {
    customerRepo;
    billRepo;
    guarantorRepo;
    garageRepo;
    constructor(customerRepo, billRepo, guarantorRepo, garageRepo) {
        this.customerRepo = customerRepo;
        this.billRepo = billRepo;
        this.guarantorRepo = guarantorRepo;
        this.garageRepo = garageRepo;
    }
    async execute(query) {
        const customer = await this.customerRepo.getByIdAsync(query.id);
        if (!customer || customer.companyId !== query.companyId) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        const [bills, guarantors, garage] = await Promise.all([
            this.billRepo.findByCustomerId(customer.id),
            this.guarantorRepo.findByCustomerId(customer.id),
            customer.garageId && this.garageRepo ? this.garageRepo.getByIdAsync(customer.garageId) : Promise.resolve(null),
        ]);
        return {
            id: customer.id,
            cId: customer.cId,
            customerCode: customer.customerCode,
            companyId: customer.companyId,
            name: customer.name,
            fatherName: customer.fatherName,
            motherName: customer.motherName,
            address: customer.address,
            mobileNumber: customer.mobileNumber,
            phoneNumbers: customer.phoneNumbers,
            documents: customer.documents || [],
            nidNumber: customer.nidNumber,
            previousUnit: customer.previousUnit,
            advanceMoney: customer.advanceMoney,
            garageId: customer.garageId,
            garageName: customer.garageName || garage?.garageName,
            isActive: customer.isActive,
            isGarageSuspended: garage ? garage.isActive === false : false,
            createdDate: customer.createdDate,
            bills: bills.map((b) => ({
                id: b.id,
                billNumber: b.billNumber,
                customerId: b.customerId,
                companyId: b.companyId,
                date: b.date,
                previousUnit: b.previousUnit,
                currentUnit: b.currentUnit,
                totalUnit: b.totalUnit,
                electricBill: b.electricBill,
                previousDues: b.previousDues,
                rentBill: b.rentBill,
                loan: b.loan,
                totalBill: b.totalBill,
                clearMoney: b.clearMoney,
                presentDues: b.presentDues,
            })),
            guarantors: guarantors.map((g) => ({
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
            })),
        };
    }
};
exports.GetCustomerByIdHandler = GetCustomerByIdHandler;
exports.GetCustomerByIdHandler = GetCustomerByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_customer_by_id_query_1.GetCustomerByIdQuery),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.GUARANTOR_REPOSITORY_TOKEN)),
    __param(3, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GetCustomerByIdHandler);
//# sourceMappingURL=get-customer-by-id.handler.js.map