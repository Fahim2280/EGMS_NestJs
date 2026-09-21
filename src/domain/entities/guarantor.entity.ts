import { AuditableEntity, AuditableProps } from '../common/auditable.entity';

export interface CreateGuarantorProps extends AuditableProps {
  id: string;
  customerId: string;
  companyId: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  address: string;
  mobileNumber: string;
  nidNumber: string;
  relationship?: string;
  createdDate?: Date;
}

export class Guarantor extends AuditableEntity {
  public readonly id: string;
  public readonly customerId: string;
  public readonly companyId: string;
  public name: string;
  public fatherName: string;
  public motherName: string;
  public address: string;
  public mobileNumber: string;
  public nidNumber: string;
  public relationship: string;

  constructor(props: CreateGuarantorProps) {
    super(props);
    this.validate(props);
    this.id = props.id;
    this.customerId = props.customerId;
    this.companyId = props.companyId;
    this.name = props.name.trim();
    this.fatherName = (props.fatherName || '').trim();
    this.motherName = (props.motherName || '').trim();
    this.address = props.address.trim();
    this.mobileNumber = props.mobileNumber.trim();
    this.nidNumber = props.nidNumber.trim();
    this.relationship = (props.relationship || '').trim();
  }

  public static create(props: CreateGuarantorProps): Guarantor {
    return new Guarantor({
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
    relationship?: string,
    updatedByStamp?: string,
  ): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Guarantor name must be at least 2 characters.');
    }
    if (!mobileNumber || mobileNumber.trim().length < 6) {
      throw new Error('Valid mobile number is required for guarantor.');
    }
    if (!nidNumber || nidNumber.trim().length < 6) {
      throw new Error('Valid NID number is required for guarantor.');
    }
    if (!address || address.trim().length < 2) {
      throw new Error('Address is required for guarantor.');
    }

    this.name = name.trim();
    this.fatherName = (fatherName || '').trim();
    this.motherName = (motherName || '').trim();
    this.address = address.trim();
    this.mobileNumber = mobileNumber.trim();
    this.nidNumber = nidNumber.trim();
    if (relationship !== undefined) {
      this.relationship = (relationship || '').trim();
    }

    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
  }

  private validate(props: CreateGuarantorProps): void {
    if (!props.id) throw new Error('Guarantor ID is required.');
    if (!props.customerId) throw new Error('Customer ID is required.');
    if (!props.companyId) throw new Error('Company ID is required.');
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Guarantor name must be at least 2 characters.');
    }
    if (!props.mobileNumber || props.mobileNumber.trim().length < 6) {
      throw new Error('Valid mobile number is required.');
    }
    if (!props.nidNumber || props.nidNumber.trim().length < 6) {
      throw new Error('Valid NID number is required.');
    }
    if (!props.address || props.address.trim().length < 2) {
      throw new Error('Address is required.');
    }
  }
}
