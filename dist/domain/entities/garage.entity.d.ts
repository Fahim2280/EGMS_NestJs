import { AuditableEntity, AuditableProps } from '../common/auditable.entity';
export interface CreateGarageProps extends AuditableProps {
    id: string;
    garageName: string;
    address: string;
    companyId: string;
}
export declare class Garage extends AuditableEntity {
    readonly id: string;
    garageName: string;
    address: string;
    readonly companyId: string;
    constructor(props: CreateGarageProps);
    static create(props: CreateGarageProps): Garage;
    updateDetails(garageName: string, address: string, updatedByStamp?: string): void;
    toggleStatus(byStamp?: string): boolean;
    private validate;
}
