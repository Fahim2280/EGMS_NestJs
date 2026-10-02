"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuditLogsQuery = void 0;
class GetAuditLogsQuery {
    companyId;
    action;
    entityType;
    search;
    days;
    page;
    limit;
    fromDate;
    toDate;
    constructor(companyId, action, entityType, search, days, page = 1, limit = 20, fromDate, toDate) {
        this.companyId = companyId;
        this.action = action;
        this.entityType = entityType;
        this.search = search;
        this.days = days;
        this.page = page;
        this.limit = limit;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}
exports.GetAuditLogsQuery = GetAuditLogsQuery;
//# sourceMappingURL=get-audit-logs.query.js.map