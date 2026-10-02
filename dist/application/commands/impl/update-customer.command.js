"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomerCommand = void 0;
class UpdateCustomerCommand {
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
exports.UpdateCustomerCommand = UpdateCustomerCommand;
//# sourceMappingURL=update-customer.command.js.map