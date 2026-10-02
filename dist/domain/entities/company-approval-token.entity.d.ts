export interface CreateCompanyApprovalTokenProps {
    id: string;
    companyId: string;
    token: string;
    expiresAt: Date;
    isUsed?: boolean;
    createdAt?: Date;
}
export declare class CompanyApprovalToken {
    readonly id: string;
    readonly companyId: string;
    readonly token: string;
    readonly expiresAt: Date;
    isUsed: boolean;
    readonly createdAt: Date;
    constructor(props: CreateCompanyApprovalTokenProps);
    isValid(): boolean;
    markUsed(): void;
}
