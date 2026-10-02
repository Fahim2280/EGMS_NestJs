"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeePermissionCommand = void 0;
class UpdateEmployeePermissionCommand {
    employeeId;
    companyId;
    role;
    isActive;
    canCreate;
    canEdit;
    canDelete;
    canView;
    garageIds;
    updatedByStamp;
    constructor(employeeId, companyId, role, isActive, canCreate, canEdit, canDelete, canView, garageIds, updatedByStamp) {
        this.employeeId = employeeId;
        this.companyId = companyId;
        this.role = role;
        this.isActive = isActive;
        this.canCreate = canCreate;
        this.canEdit = canEdit;
        this.canDelete = canDelete;
        this.canView = canView;
        this.garageIds = garageIds;
        this.updatedByStamp = updatedByStamp;
    }
}
exports.UpdateEmployeePermissionCommand = UpdateEmployeePermissionCommand;
//# sourceMappingURL=update-employee-permission.command.js.map