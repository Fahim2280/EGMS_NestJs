"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditableEntity = void 0;
class AuditableEntity {
    isActive;
    isDeleted;
    createdBy;
    editByName;
    deletedBy;
    createdDate;
    modifiedDate;
    deletedDate;
    constructor(props) {
        this.isActive = props?.isActive ?? true;
        this.isDeleted = props?.isDeleted ?? false;
        this.createdBy = props?.createdBy;
        this.editByName = props?.editByName ?? props?.createdBy;
        this.deletedBy = props?.deletedBy;
        this.createdDate = props?.createdDate || props?.createdAt || new Date();
        this.modifiedDate = props?.modifiedDate || props?.updatedAt;
        this.deletedDate = props?.deletedDate;
    }
    get createdAt() {
        return this.createdDate;
    }
    get updatedAt() {
        return this.modifiedDate || this.createdDate;
    }
    markModified(byStamp) {
        this.editByName = byStamp;
        this.modifiedDate = new Date();
    }
    softDelete(byStamp) {
        this.isDeleted = true;
        this.isActive = false;
        this.deletedBy = byStamp;
        this.deletedDate = new Date();
        this.modifiedDate = new Date();
    }
    restore(byStamp) {
        this.isDeleted = false;
        this.isActive = true;
        this.deletedBy = undefined;
        this.deletedDate = undefined;
        this.markModified(byStamp);
    }
    activate(byStamp) {
        this.isActive = true;
        if (byStamp)
            this.markModified(byStamp);
    }
    deactivate(byStamp) {
        this.isActive = false;
        if (byStamp)
            this.markModified(byStamp);
    }
}
exports.AuditableEntity = AuditableEntity;
//# sourceMappingURL=auditable.entity.js.map