import { AuditableEntity, AuditableProps } from '../common/auditable.entity';
export type RegistrationStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';
export interface CreateCompanyProps extends AuditableProps {
    id: string;
    name: string;
    companyName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    role?: string;
    unitRate?: number;
    registrationStatus?: RegistrationStatus;
}
export declare class Company extends AuditableEntity {
    readonly id: string;
    name: string;
    companyName: string;
    email: string;
    password: string;
    phoneNumber: string;
    readonly role: string;
    address: string;
    unitRate: number;
    registrationStatus: RegistrationStatus;
    constructor(props: CreateCompanyProps);
    static create(props: CreateCompanyProps): Company;
    updateDetails(name: string, companyName: string, phoneNumber: string, address: string, unitRate?: number, updatedByStamp?: string): void;
    approve(): void;
    updatePassword(hashedPassword: string, updatedByStamp?: string): void;
    private validate;
}
