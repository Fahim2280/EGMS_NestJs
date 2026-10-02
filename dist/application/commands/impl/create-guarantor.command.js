"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGuarantorCommand = void 0;
class CreateGuarantorCommand {
    companyId;
    customerId;
    dto;
    actorStamp;
    constructor(companyId, customerId, dto, actorStamp) {
        this.companyId = companyId;
        this.customerId = customerId;
        this.dto = dto;
        this.actorStamp = actorStamp;
    }
}
exports.CreateGuarantorCommand = CreateGuarantorCommand;
//# sourceMappingURL=create-guarantor.command.js.map