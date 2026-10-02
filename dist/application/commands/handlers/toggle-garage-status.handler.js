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
exports.ToggleGarageStatusHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const toggle_garage_status_command_1 = require("../impl/toggle-garage-status.command");
const index_1 = require("../../../domain/index");
let ToggleGarageStatusHandler = class ToggleGarageStatusHandler {
    garageRepo;
    constructor(garageRepo) {
        this.garageRepo = garageRepo;
    }
    async execute(command) {
        const { id, companyId, actorStamp } = command;
        const garage = await this.garageRepo.getByIdAsync(id);
        if (!garage || garage.companyId !== companyId) {
            throw new common_1.NotFoundException(`Garage with ID '${id}' was not found.`);
        }
        const isActive = garage.toggleStatus(actorStamp || `${companyId}|SUPER_ADMIN`);
        await this.garageRepo.updateAsync(garage);
        return { garage, isActive };
    }
};
exports.ToggleGarageStatusHandler = ToggleGarageStatusHandler;
exports.ToggleGarageStatusHandler = ToggleGarageStatusHandler = __decorate([
    (0, cqrs_1.CommandHandler)(toggle_garage_status_command_1.ToggleGarageStatusCommand),
    __param(0, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], ToggleGarageStatusHandler);
//# sourceMappingURL=toggle-garage-status.handler.js.map