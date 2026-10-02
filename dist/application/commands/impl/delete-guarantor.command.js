"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGuarantorCommand = void 0;
class DeleteGuarantorCommand {
    companyId;
    customerId;
    guarantorId;
    actorStamp;
    constructor(companyId, customerId, guarantorId, actorStamp) {
        this.companyId = companyId;
        this.customerId = customerId;
        this.guarantorId = guarantorId;
        this.actorStamp = actorStamp;
    }
}
exports.DeleteGuarantorCommand = DeleteGuarantorCommand;
//# sourceMappingURL=delete-guarantor.command.js.map