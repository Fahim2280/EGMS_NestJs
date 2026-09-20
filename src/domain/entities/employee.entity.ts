import { AuditableEntity, AuditableProps } from '../common/auditable.entity';

export interface CreateEmployeeProps extends AuditableProps {
  id: string;
  companyId: string;
  name: string;
  address: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: string;
  nidNumber: string;
}

export class Employee extends AuditableEntity {
  public readonly id: string;
  public readonly companyId: string;
  public name: string;
  public address: string;
  public email: string;
  public password: string;
  public phoneNumber: string;
  public role: string;
  public nidNumber: string;

  constructor(props: CreateEmployeeProps) {
    super(props);
    this.validate(props);
    this.id = props.id;
    this.companyId = props.companyId;
    this.name = props.name.trim();
    this.address = props.address.trim();
    this.email = props.email.trim().toLowerCase();
    this.password = props.password;
    this.phoneNumber = props.phoneNumber.trim();
    this.role = props.role || 'GENERAL';
    this.nidNumber = props.nidNumber.trim();
  }

  public static create(props: CreateEmployeeProps): Employee {
    return new Employee({
      ...props,
      role: 'GENERAL',
      isActive: true,
      isDeleted: false,
      createdDate: new Date(),
    });
  }

  public updateDetails(
    name: string,
    address: string,
    phoneNumber: string,
    nidNumber: string,
    updatedByStamp?: string,
  ): void {
    if (!name || name.trim().length < 2) throw new Error('Employee name must be at least 2 characters.');
    if (!address || address.trim().length < 3) throw new Error('Address must be at least 3 characters.');
    if (!phoneNumber || phoneNumber.trim().length < 6) throw new Error('Phone number is required.');
    if (!nidNumber || nidNumber.trim().length < 5) throw new Error('A valid NID Number is required.');
    this.name = name.trim();
    this.address = address.trim();
    this.phoneNumber = phoneNumber.trim();
    this.nidNumber = nidNumber.trim();
    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
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

  public updateRole(newRole: string, updatedByStamp?: string): void {
    const validRoles = ['SUPER_ADMIN', 'GENERAL'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role '${newRole}'. Allowed roles: ${validRoles.join(', ')}`);
    }
    this.role = newRole;
    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
  }

  private validate(props: CreateEmployeeProps): void {
    if (!props.id) throw new Error('Employee ID is required.');
    if (!props.companyId) throw new Error('Company ID is required.');
    if (!props.name || props.name.trim().length < 2) throw new Error('Employee name must be at least 2 characters.');
    if (!props.address || props.address.trim().length < 3) throw new Error('Address must be at least 3 characters.');
    if (!props.email || !props.email.includes('@')) throw new Error('A valid email address is required.');
    if (!props.password) throw new Error('Password is required.');
    if (!props.phoneNumber || props.phoneNumber.trim().length < 6) throw new Error('Phone number is required.');
    if (!props.nidNumber || props.nidNumber.trim().length < 5) throw new Error('NID number must be at least 5 characters.');
  }
}
