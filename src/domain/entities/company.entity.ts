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

export class Company extends AuditableEntity {
  public readonly id: string;
  public name: string;
  public companyName: string;
  public email: string;
  public password: string;
  public phoneNumber: string;
  public readonly role: string;
  public address: string;
  public unitRate: number;
  public registrationStatus: RegistrationStatus;

  constructor(props: CreateCompanyProps) {
    super(props);
    this.validate(props);
    this.id = props.id;
    this.name = props.name.trim();
    this.companyName = props.companyName.trim();
    this.email = props.email.trim().toLowerCase();
    this.password = props.password;
    this.phoneNumber = props.phoneNumber.trim();
    this.role = props.role || 'SUPER_ADMIN';
    this.address = props.address.trim();
    this.unitRate = props.unitRate !== undefined && props.unitRate !== null ? Number(props.unitRate) : 15;
    this.registrationStatus = props.registrationStatus ?? 'PENDING';
  }

  public static create(props: CreateCompanyProps): Company {
    return new Company({
      ...props,
      role: 'SUPER_ADMIN',
      isActive: false,
      registrationStatus: 'PENDING',
      isDeleted: false,
      createdDate: new Date(),
    });
  }

  public updateDetails(
    name: string,
    companyName: string,
    phoneNumber: string,
    address: string,
    unitRate?: number,
    updatedByStamp?: string,
  ): void {
    if (!name || name.trim().length < 2) throw new Error('Name must be at least 2 characters.');
    if (!companyName || companyName.trim().length < 2) throw new Error('Company name must be at least 2 characters.');
    this.name = name.trim();
    this.companyName = companyName.trim();
    this.phoneNumber = phoneNumber.trim();
    this.address = address.trim();
    if (unitRate !== undefined && unitRate !== null) {
      if (Number(unitRate) <= 0) throw new Error('Unit rate must be greater than 0.');
      this.unitRate = Number(unitRate);
    }
    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
  }

  public approve(): void {
    this.registrationStatus = 'ACTIVE';
    this.isActive = true;
    this.modifiedDate = new Date();
  }

  public updatePassword(hashedPassword: string, updatedByStamp?: string): void {
    if (!hashedPassword) throw new Error('Password hash cannot be empty.');
    this.password = hashedPassword;
    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
  }

  private validate(props: CreateCompanyProps): void {
    if (!props.id) throw new Error('Company ID is required.');
    if (!props.name || props.name.trim().length < 2) throw new Error('Name must be at least 2 characters.');
    if (!props.companyName || props.companyName.trim().length < 2) throw new Error('Company name must be at least 2 characters.');
    if (!props.email || !props.email.includes('@')) throw new Error('A valid company email is required.');
    if (!props.password) throw new Error('Password is required.');
    if (!props.phoneNumber || props.phoneNumber.trim().length < 6) throw new Error('Phone number is required.');
    if (!props.address || props.address.trim().length < 3) throw new Error('Address is required.');
  }
}
