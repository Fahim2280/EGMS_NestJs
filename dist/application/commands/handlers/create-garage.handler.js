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
exports.CreateGarageHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const create_garage_command_1 = require("../impl/create-garage.command");
const index_1 = require("../../../domain/index");
let CreateGarageHandler = class CreateGarageHandler {
    garageRepo;
    companyRepo;
    constructor(garageRepo, companyRepo) {
        this.garageRepo = garageRepo;
        this.companyRepo = companyRepo;
    }
    async execute(command) {
        const { companyId, dto } = command;
        const company = await this.companyRepo.findById(companyId);
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID '${companyId}' was not found.`);
        }
        const garage = index_1.Garage.create({
            id: (0, uuid_1.v4)(),
            companyId: company.id,
            garageName: dto.garageName,
            address: dto.address,
            createdBy: `${company.id}|SUPER_ADMIN`,
        });
        await this.garageRepo.save(garage);
        return garage;
    }
};
exports.CreateGarageHandler = CreateGarageHandler;
exports.CreateGarageHandler = CreateGarageHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_garage_command_1.CreateGarageCommand),
    __param(0, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], CreateGarageHandler);
//# sourceMappingURL=create-garage.handler.js.map