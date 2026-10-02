export declare class ResetPasswordCommand {
    readonly email: string;
    readonly token: string;
    readonly newPassword: string;
    constructor(email: string, token: string, newPassword: string);
}
