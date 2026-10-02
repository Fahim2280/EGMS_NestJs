import { AuditableEntity, AuditableProps } from '../common/auditable.entity';
import { ContactPhone } from '../common/contact-phone.interface';
import { AttachedDocument } from '../common/attached-document.interface';
export interface CreateGuarantorProps extends AuditableProps {
    id: string;
    customerId?: string;
    employeeId?: string;
    companyId: string;
    name: string;
    fatherName?: string;
    motherName?: string;
    address: string;
    mobileNumber?: string;
    phoneNumbers?: ContactPhone[];
    documents?: AttachedDocument[];
    nidNumber: string;
    relationship?: string;
    createdDate?: Date;
}
export declare class Guarantor extends AuditableEntity {
    readonly id: string;
    readonly customerId?: string;
    readonly employeeId?: string;
    readonly companyId: string;
    name: string;
    fatherName: string;
    motherName: string;
    address: string;
    mobileNumber: string;
    phoneNumbers: ContactPhone[];
    documents: AttachedDocument[];
    nidNumber: string;
    relationship: string;
    constructor(props: CreateGuarantorProps);
    static create(props: CreateGuarantorProps): Guarantor;
    updateDetails(name: string, fatherName: string, motherName: string, address: string, mobileNumber: string, nidNumber: string, relationship?: string, updatedByStamp?: string, phoneNumbers?: ContactPhone[]): void;
    addDocument(doc: AttachedDocument): void;
    removeDocument(docId: string): AttachedDocument | null;
    setDocuments(docs: AttachedDocument[]): void;
    private validate;
}
