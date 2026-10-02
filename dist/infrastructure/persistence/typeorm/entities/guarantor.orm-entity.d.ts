import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { CustomerOrmEntity } from './customer.orm-entity';
import { EmployeeOrmEntity } from './employee.orm-entity';
import { ContactPhone } from '../../../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../../../domain/common/attached-document.interface';
export declare class GuarantorOrmEntity extends BaseAuditableOrmEntity {
    id: string;
    customerId?: string | null;
    employeeId?: string | null;
    companyId: string;
    name: string;
    fatherName: string;
    motherName: string;
    mobileNumber: string;
    phoneNumbers: ContactPhone[] | null;
    documents: AttachedDocument[] | null;
    nidNumber: string;
    address: string;
    relationship: string;
    customer?: CustomerOrmEntity | null;
    employee?: EmployeeOrmEntity | null;
    company: CompanyOrmEntity;
}
