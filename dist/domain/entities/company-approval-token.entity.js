"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyApprovalToken = void 0;
class CompanyApprovalToken {
    id;
    companyId;
    token;
    expiresAt;
    isUsed;
    createdAt;
    constructor(props) {
        this.id = props.id;
        this.companyId = props.companyId;
        this.token = props.token;
        this.expiresAt = new Date(props.expiresAt);
        this.isUsed = props.isUsed ?? false;
        this.createdAt = props.createdAt ?? new Date();
    }
    isValid() {
        return !this.isUsed && this.expiresAt.getTime() > Date.now();
    }
    markUsed() {
        this.isUsed = true;
    }
}
exports.CompanyApprovalToken = CompanyApprovalToken;
//# sourceMappingURL=company-approval-token.entity.js.map