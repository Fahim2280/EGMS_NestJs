"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordCommand = void 0;
class ResetPasswordCommand {
    email;
    token;
    newPassword;
    constructor(email, token, newPassword) {
        this.email = email;
        this.token = token;
        this.newPassword = newPassword;
    }
}
exports.ResetPasswordCommand = ResetPasswordCommand;
//# sourceMappingURL=reset-password.command.js.map