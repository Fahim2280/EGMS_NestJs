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
exports.UpdateGarageHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_garage_command_1 = require("../impl/update-garage.command");
const index_1 = require("../../../domain/index");
let UpdateGarageHandler = class UpdateGarageHandler {
    garageRepo;
    constructor(garageRepo) {
        this.garageRepo = garageRepo;
    }
    async execute(command) {
        const { id, companyId, dto, actorStamp } = command;
        const garage = await this.garageRepo.getByIdAsync(id);
        if (!garage || garage.companyId !== companyId) {
            throw new common_1.NotFoundException(`Garage with ID '${id}' was not found.`);
        }
        garage.updateDetails(dto.garageName ?? garage.garageName, dto.address ?? garage.address, actorStamp || `${companyId}|SUPER_ADMIN`);
        await this.garageRepo.updateAsync(garage);
        return garage;
    }
};
exports.UpdateGarageHandler = UpdateGarageHandler;
exports.UpdateGarageHandler = UpdateGarageHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_garage_command_1.UpdateGarageCommand),
    __param(0, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], UpdateGarageHandler);
//# sourceMappingURL=update-garage.handler.js.map