"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetToken = void 0;
class PasswordResetToken {
    id;
    email;
    token;
    expiresAt;
    isUsed;
    createdAt;
    constructor(props) {
        this.id = props.id;
        this.email = props.email.trim().toLowerCase();
        this.token = props.token;
        this.expiresAt = new Date(props.expiresAt);
        this.isUsed = props.isUsed ?? false;
        this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    }
    isValid() {
        return !this.isUsed && this.expiresAt.getTime() > Date.now();
    }
    markUsed() {
        this.isUsed = true;
    }
}
exports.PasswordResetToken = PasswordResetToken;
//# sourceMappingURL=password-reset-token.entity.js.map