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
exports.DeleteCustomerHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_customer_command_1 = require("../impl/delete-customer.command");
const index_1 = require("../../../domain/index");
let DeleteCustomerHandler = class DeleteCustomerHandler {
    customerRepo;
    constructor(customerRepo) {
        this.customerRepo = customerRepo;
    }
    async execute(command) {
        const { id, companyId, actorStamp } = command;
        const customer = await this.customerRepo.getByIdAsync(id);
        if (!customer || customer.companyId !== companyId) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        customer.softDelete(actorStamp || `${companyId}|SUPER_ADMIN`);
        await this.customerRepo.updateAsync(customer);
        return true;
    }
};
exports.DeleteCustomerHandler = DeleteCustomerHandler;
exports.DeleteCustomerHandler = DeleteCustomerHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_customer_command_1.DeleteCustomerCommand),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], DeleteCustomerHandler);
//# sourceMappingURL=delete-customer.handler.js.map