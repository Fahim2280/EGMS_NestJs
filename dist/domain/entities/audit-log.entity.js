"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
class AuditLog {
    id;
    companyId;
    userId;
    userName;
    userRole;
    action;
    entityType;
    entityId;
    entityName;
    details;
    ipAddress;
    userAgent;
    createdDate;
    constructor(props) {
        if (!props.id)
            throw new Error('AuditLog ID is required.');
        if (!props.companyId)
            throw new Error('Company ID is required.');
        if (!props.userId)
            throw new Error('User ID is required.');
        if (!props.action)
            throw new Error('Action is required.');
        if (!props.entityType)
            throw new Error('Entity type is required.');
        this.id = props.id;
        this.companyId = props.companyId;
        this.userId = props.userId;
        this.userName = props.userName || 'System';
        this.userRole = props.userRole || 'GENERAL';
        this.action = props.action.toUpperCase();
        this.entityType = props.entityType.toUpperCase();
        this.entityId = props.entityId || null;
        this.entityName = props.entityName || null;
        this.details = props.details || null;
        this.ipAddress = props.ipAddress || null;
        this.userAgent = props.userAgent || null;
        this.createdDate = props.createdDate || new Date();
    }
    static create(props) {
        return new AuditLog(props);
    }
}
exports.AuditLog = AuditLog;
//# sourceMappingURL=audit-log.entity.js.map