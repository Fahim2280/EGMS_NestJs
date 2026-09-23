import { AuditableEntity, AuditableProps } from '../common/auditable.entity';
import { ContactPhone } from '../common/contact-phone.interface';
import { AttachedDocument } from '../common/attached-document.interface';

export interface CreateCustomerProps extends AuditableProps {
  id: string;
  cId?: number;
  companyId: string;
  customerCode?: string | null;
  name: string;
  fatherName: string;
  motherName: string;
  address: string;
  mobileNumber?: string;
  phoneNumbers?: ContactPhone[];
  documents?: AttachedDocument[];
  nidNumber: string;
  previousUnit: number;
  advanceMoney: number;
  garageId?: string;
  garageName?: string;
  createdDate?: Date;
}

export class Customer extends AuditableEntity {
  public readonly id: string;
  public cId?: number;
  public companyId: string;
  public customerCode?: string | null;
  public name: string;
  public fatherName: string;
  public motherName: string;
  public address: string;
  public mobileNumber: string;
  public phoneNumbers: ContactPhone[];
  public documents: AttachedDocument[];
  public nidNumber: string;
  public previousUnit: number;
  public advanceMoney: number;
  public garageId?: string;
  public garageName?: string;

  constructor(props: CreateCustomerProps) {
    super(props);
    this.validate(props);
    this.id = props.id;
    this.cId = props.cId;
    this.companyId = props.companyId;
    this.customerCode = props.customerCode?.trim() || null;
    this.name = props.name.trim();
    this.fatherName = props.fatherName.trim();
    this.motherName = props.motherName.trim();
    this.address = props.address.trim();
    this.documents = props.documents ? [...props.documents] : [];

    // Initialize phone numbers collection and sync primary mobileNumber
    if (props.phoneNumbers && props.phoneNumbers.length > 0) {
      this.phoneNumbers = props.phoneNumbers.map((p) => ({
        number: p.number.trim(),
        type: p.type || 'PERSONAL',
        isPrimary: Boolean(p.isPrimary),
      }));
      const primary = this.phoneNumbers.find((p) => p.isPrimary) || this.phoneNumbers[0];
      primary.isPrimary = true;
      this.mobileNumber = primary.number;
    } else {
      const mob = (props.mobileNumber || '').trim();
      this.mobileNumber = mob;
      this.phoneNumbers = mob ? [{ number: mob, type: 'PRIMARY', isPrimary: true }] : [];
    }

    this.nidNumber = props.nidNumber.trim();
    this.previousUnit = Number(props.previousUnit) || 0;
    this.advanceMoney = Number(props.advanceMoney) || 0;
    this.garageId = props.garageId;
    this.garageName = props.garageName;
  }

  public static create(props: CreateCustomerProps): Customer {
    return new Customer({
      ...props,
      isActive: true,
      isDeleted: false,
      createdDate: props.createdDate || new Date(),
    });
  }

  public updateDetails(
    name: string,
    fatherName: string,
    motherName: string,
    address: string,
    mobileNumber: string,
    nidNumber: string,
    previousUnit: number,
    advanceMoney: number,
    garageId?: string,
    customerCode?: string | null,
    updatedByStamp?: string,
    phoneNumbers?: ContactPhone[],
  ): void {
    if (!name || name.trim().length < 2) throw new Error('Name must be at least 2 characters.');

    if (phoneNumbers && phoneNumbers.length > 0) {
      this.phoneNumbers = phoneNumbers.map((p) => ({
        number: p.number.trim(),
        type: p.type || 'PERSONAL',
        isPrimary: Boolean(p.isPrimary),
      }));
      const primary = this.phoneNumbers.find((p) => p.isPrimary) || this.phoneNumbers[0];
      primary.isPrimary = true;
      this.mobileNumber = primary.number;
    } else {
      if (!mobileNumber || mobileNumber.trim().length < 6) throw new Error('Valid mobile number is required.');
      this.mobileNumber = mobileNumber.trim();
      this.phoneNumbers = [{ number: this.mobileNumber, type: 'PRIMARY', isPrimary: true }];
    }

    if (!nidNumber || nidNumber.trim().length < 6) throw new Error('Valid NID number is required.');

    this.name = name.trim();
    this.fatherName = fatherName.trim();
    this.motherName = motherName.trim();
    this.address = address.trim();
    this.nidNumber = nidNumber.trim();
    this.previousUnit = Number(previousUnit) || 0;
    this.advanceMoney = Number(advanceMoney) || 0;
    if (garageId !== undefined) {
      this.garageId = garageId;
    }
    if (customerCode !== undefined) {
      this.customerCode = customerCode?.trim() || null;
    }

    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
  }

  public addDocument(doc: AttachedDocument): void {
    if (!this.documents) {
      this.documents = [];
    }
    this.documents.push(doc);
    this.modifiedDate = new Date();
  }

  public removeDocument(docId: string): AttachedDocument | null {
    if (!this.documents || this.documents.length === 0) {
      return null;
    }
    const index = this.documents.findIndex((d) => d.id === docId);
    if (index === -1) {
      return null;
    }
    const [removed] = this.documents.splice(index, 1);
    this.modifiedDate = new Date();
    return removed;
  }

  public setDocuments(docs: AttachedDocument[]): void {
    this.documents = docs ? [...docs] : [];
    this.modifiedDate = new Date();
  }

  private validate(props: CreateCustomerProps): void {
    if (!props.id) throw new Error('Customer ID is required.');
    if (!props.companyId) throw new Error('Company ID is required.');
    if (!props.name || props.name.trim().length < 2) throw new Error('Customer name must be at least 2 characters.');
    const hasValidPhone =
      (props.phoneNumbers && props.phoneNumbers.length > 0 && props.phoneNumbers[0].number?.trim().length >= 6) ||
      (props.mobileNumber && props.mobileNumber.trim().length >= 6);
    if (!hasValidPhone) throw new Error('Valid mobile number is required.');
    if (!props.nidNumber || props.nidNumber.trim().length < 6) throw new Error('Valid NID number is required.');
  }
}
