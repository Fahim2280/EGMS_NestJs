"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateElectricBillCommand = void 0;
class UpdateElectricBillCommand {
    id;
    companyId;
    dto;
    actorStamp;
    constructor(id, companyId, dto, actorStamp) {
        this.id = id;
        this.companyId = companyId;
        this.dto = dto;
        this.actorStamp = actorStamp;
    }
}
exports.UpdateElectricBillCommand = UpdateElectricBillCommand;
//# sourceMappingURL=update-electric-bill.command.js.map