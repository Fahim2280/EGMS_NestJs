"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteEmployeeGuarantorCommand = void 0;
class DeleteEmployeeGuarantorCommand {
    companyId;
    employeeId;
    guarantorId;
    actorStamp;
    constructor(companyId, employeeId, guarantorId, actorStamp) {
        this.companyId = companyId;
        this.employeeId = employeeId;
        this.guarantorId = guarantorId;
        this.actorStamp = actorStamp;
    }
}
exports.DeleteEmployeeGuarantorCommand = DeleteEmployeeGuarantorCommand;
//# sourceMappingURL=delete-employee-guarantor.command.js.map