"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateElectricBillCommand = void 0;
class CreateElectricBillCommand {
    companyId;
    dto;
    actorStamp;
    constructor(companyId, dto, actorStamp) {
        this.companyId = companyId;
        this.dto = dto;
        this.actorStamp = actorStamp;
    }
}
exports.CreateElectricBillCommand = CreateElectricBillCommand;
//# sourceMappingURL=create-electric-bill.command.js.map