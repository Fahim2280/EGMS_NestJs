import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { GarageOrmEntity } from './garage.orm-entity';
import { GuarantorOrmEntity } from './guarantor.orm-entity';
import { ContactPhone } from '../../../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../../../domain/common/attached-document.interface';
export declare class EmployeeOrmEntity extends BaseAuditableOrmEntity {
    id: string;
    companyId: string;
    name: string;
    address: string;
    email: string;
    password: string;
    phoneNumber: string;
    phoneNumbers: ContactPhone[] | null;
    documents: AttachedDocument[] | null;
    role: string;
    nidNumber: string;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;
    company: CompanyOrmEntity;
    permittedGarages: GarageOrmEntity[];
    guarantors: GuarantorOrmEntity[];
}
