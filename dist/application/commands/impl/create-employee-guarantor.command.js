"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEmployeeGuarantorCommand = void 0;
class CreateEmployeeGuarantorCommand {
    companyId;
    employeeId;
    dto;
    actorStamp;
    constructor(companyId, employeeId, dto, actorStamp) {
        this.companyId = companyId;
        this.employeeId = employeeId;
        this.dto = dto;
        this.actorStamp = actorStamp;
    }
}
exports.CreateEmployeeGuarantorCommand = CreateEmployeeGuarantorCommand;
//# sourceMappingURL=create-employee-guarantor.command.js.map