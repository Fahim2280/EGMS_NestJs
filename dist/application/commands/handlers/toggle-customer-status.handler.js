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
exports.ToggleCustomerStatusHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const toggle_customer_status_command_1 = require("../impl/toggle-customer-status.command");
const index_1 = require("../../../domain/index");
let ToggleCustomerStatusHandler = class ToggleCustomerStatusHandler {
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
        const isActive = customer.toggleStatus(actorStamp || `${companyId}|SUPER_ADMIN`);
        await this.customerRepo.updateAsync(customer);
        return { customer, isActive };
    }
};
exports.ToggleCustomerStatusHandler = ToggleCustomerStatusHandler;
exports.ToggleCustomerStatusHandler = ToggleCustomerStatusHandler = __decorate([
    (0, cqrs_1.CommandHandler)(toggle_customer_status_command_1.ToggleCustomerStatusCommand),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], ToggleCustomerStatusHandler);
//# sourceMappingURL=toggle-customer-status.handler.js.map