"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGuarantorCommand = void 0;
class UpdateGuarantorCommand {
    companyId;
    customerId;
    guarantorId;
    dto;
    actorStamp;
    constructor(companyId, customerId, guarantorId, dto, actorStamp) {
        this.companyId = companyId;
        this.customerId = customerId;
        this.guarantorId = guarantorId;
        this.dto = dto;
        this.actorStamp = actorStamp;
    }
}
exports.UpdateGuarantorCommand = UpdateGuarantorCommand;
//# sourceMappingURL=update-guarantor.command.js.map