"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteEmployeeCommand = void 0;
class DeleteEmployeeCommand {
    id;
    companyId;
    deletedByStamp;
    constructor(id, companyId, deletedByStamp) {
        this.id = id;
        this.companyId = companyId;
        this.deletedByStamp = deletedByStamp;
    }
}
exports.DeleteEmployeeCommand = DeleteEmployeeCommand;
//# sourceMappingURL=delete-employee.command.js.map