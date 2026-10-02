"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerCommand = void 0;
class CreateCustomerCommand {
    companyId;
    dto;
    actorStamp;
    constructor(companyId, dto, actorStamp) {
        this.companyId = companyId;
        this.dto = dto;
        this.actorStamp = actorStamp;
    }
}
exports.CreateCustomerCommand = CreateCustomerCommand;
//# sourceMappingURL=create-customer.command.js.map