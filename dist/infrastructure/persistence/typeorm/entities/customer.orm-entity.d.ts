import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { ElectricBillOrmEntity } from './electric-bill.orm-entity';
import { GarageOrmEntity } from './garage.orm-entity';
import { GuarantorOrmEntity } from './guarantor.orm-entity';
import { ContactPhone } from '../../../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../../../domain/common/attached-document.interface';
export declare class CustomerOrmEntity extends BaseAuditableOrmEntity {
    id: string;
    cId: number;
    customerCode?: string | null;
    companyId: string;
    name: string;
    fatherName: string;
    motherName: string;
    address: string;
    mobileNumber: string;
    phoneNumbers: ContactPhone[] | null;
    documents: AttachedDocument[] | null;
    nidNumber: string;
    previousUnit: number;
    advanceMoney: number;
    garageId?: string | null;
    garage: GarageOrmEntity;
    company: CompanyOrmEntity;
    bills: ElectricBillOrmEntity[];
    guarantors: GuarantorOrmEntity[];
}
