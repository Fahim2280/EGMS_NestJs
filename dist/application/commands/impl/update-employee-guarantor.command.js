"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeGuarantorCommand = void 0;
class UpdateEmployeeGuarantorCommand {
    companyId;
    employeeId;
    guarantorId;
    dto;
    actorStamp;
    constructor(companyId, employeeId, guarantorId, dto, actorStamp) {
        this.companyId = companyId;
        this.employeeId = employeeId;
        this.guarantorId = guarantorId;
        this.dto = dto;
        this.actorStamp = actorStamp;
    }
}
exports.UpdateEmployeeGuarantorCommand = UpdateEmployeeGuarantorCommand;
//# sourceMappingURL=update-employee-guarantor.command.js.map