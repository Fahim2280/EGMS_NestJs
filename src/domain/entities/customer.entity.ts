import { AuditableEntity, AuditableProps } from '../common/auditable.entity';

export interface CreateCustomerProps extends AuditableProps {
  id: string;
  cId?: number;
  companyId: string;
  customerCode?: string | null;
  name: string;
  fatherName: string;
  motherName: string;
  address: string;
  mobileNumber: string;
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
    this.mobileNumber = props.mobileNumber.trim();
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
  ): void {
    if (!name || name.trim().length < 2) throw new Error('Name must be at least 2 characters.');
    if (!mobileNumber || mobileNumber.trim().length < 6) throw new Error('Valid mobile number is required.');
    if (!nidNumber || nidNumber.trim().length < 6) throw new Error('Valid NID number is required.');

    this.name = name.trim();
    this.fatherName = fatherName.trim();
    this.motherName = motherName.trim();
    this.address = address.trim();
    this.mobileNumber = mobileNumber.trim();
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

  private validate(props: CreateCustomerProps): void {
    if (!props.id) throw new Error('Customer ID is required.');
    if (!props.companyId) throw new Error('Company ID is required.');
    if (!props.name || props.name.trim().length < 2) throw new Error('Customer name must be at least 2 characters.');
    if (!props.mobileNumber || props.mobileNumber.trim().length < 6) throw new Error('Valid mobile number is required.');
    if (!props.nidNumber || props.nidNumber.trim().length < 6) throw new Error('Valid NID number is required.');
  }
}
