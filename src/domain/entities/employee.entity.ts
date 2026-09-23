import { AuditableEntity, AuditableProps } from '../common/auditable.entity';
import { ContactPhone } from '../common/contact-phone.interface';
import { AttachedDocument } from '../common/attached-document.interface';

export interface CreateEmployeeProps extends AuditableProps {
  id: string;
  companyId: string;
  name: string;
  address: string;
  email: string;
  password: string;
  phoneNumber?: string;
  phoneNumbers?: ContactPhone[];
  documents?: AttachedDocument[];
  role?: string;
  nidNumber: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  permittedGarageIds?: string[];
}

export class Employee extends AuditableEntity {
  public readonly id: string;
  public readonly companyId: string;
  public name: string;
  public address: string;
  public email: string;
  public password: string;
  public phoneNumber: string;
  public phoneNumbers: ContactPhone[];
  public documents: AttachedDocument[];
  public role: string;
  public nidNumber: string;
  public canCreate: boolean;
  public canEdit: boolean;
  public canDelete: boolean;
  public canView: boolean;
  public permittedGarageIds: string[];

  constructor(props: CreateEmployeeProps) {
    super(props);
    this.validate(props);
    this.id = props.id;
    this.companyId = props.companyId;
    this.name = props.name.trim();
    this.address = props.address.trim();
    this.email = props.email.trim().toLowerCase();
    this.password = props.password;
    this.documents = props.documents ? [...props.documents] : [];

    if (props.phoneNumbers && props.phoneNumbers.length > 0) {
      this.phoneNumbers = props.phoneNumbers.map((p) => ({
        number: p.number.trim(),
        type: p.type || 'PERSONAL',
        isPrimary: Boolean(p.isPrimary),
      }));
      const primary = this.phoneNumbers.find((p) => p.isPrimary) || this.phoneNumbers[0];
      primary.isPrimary = true;
      this.phoneNumber = primary.number;
    } else {
      const ph = (props.phoneNumber || '').trim();
      this.phoneNumber = ph;
      this.phoneNumbers = ph ? [{ number: ph, type: 'PRIMARY', isPrimary: true }] : [];
    }

    this.role = props.role || 'GENERAL';
    this.nidNumber = props.nidNumber.trim();
    this.canCreate = props.canCreate ?? (props.role === 'SUPER_ADMIN');
    this.canEdit = props.canEdit ?? (props.role === 'SUPER_ADMIN');
    this.canDelete = props.canDelete ?? (props.role === 'SUPER_ADMIN');
    this.canView = props.canView ?? true;
    this.permittedGarageIds = props.permittedGarageIds ? [...props.permittedGarageIds] : [];
  }

  public static create(props: CreateEmployeeProps): Employee {
    return new Employee({
      ...props,
      role: props.role || 'GENERAL',
      canCreate: props.canCreate ?? (props.role === 'SUPER_ADMIN'),
      canEdit: props.canEdit ?? (props.role === 'SUPER_ADMIN'),
      canDelete: props.canDelete ?? (props.role === 'SUPER_ADMIN'),
      canView: props.canView ?? true,
      permittedGarageIds: props.permittedGarageIds ? [...props.permittedGarageIds] : [],
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
    phoneNumbers?: ContactPhone[],
  ): void {
    if (!name || name.trim().length < 2) throw new Error('Employee name must be at least 2 characters.');
    if (!address || address.trim().length < 3) throw new Error('Address must be at least 3 characters.');

    if (phoneNumbers && phoneNumbers.length > 0) {
      this.phoneNumbers = phoneNumbers.map((p) => ({
        number: p.number.trim(),
        type: p.type || 'PERSONAL',
        isPrimary: Boolean(p.isPrimary),
      }));
      const primary = this.phoneNumbers.find((p) => p.isPrimary) || this.phoneNumbers[0];
      primary.isPrimary = true;
      this.phoneNumber = primary.number;
    } else {
      if (!phoneNumber || phoneNumber.trim().length < 6) throw new Error('Phone number is required.');
      this.phoneNumber = phoneNumber.trim();
      this.phoneNumbers = [{ number: this.phoneNumber, type: 'PRIMARY', isPrimary: true }];
    }

    if (!nidNumber || nidNumber.trim().length < 5) throw new Error('A valid NID Number is required.');
    this.name = name.trim();
    this.address = address.trim();
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

  public updatePermissions(
    canCreate: boolean,
    canEdit: boolean,
    canDelete: boolean,
    canView: boolean,
    garageIds: string[],
    updatedByStamp?: string,
  ): void {
    this.canCreate = Boolean(canCreate);
    this.canEdit = Boolean(canEdit);
    this.canDelete = Boolean(canDelete);
    this.canView = Boolean(canView);
    this.permittedGarageIds = Array.isArray(garageIds) ? [...garageIds] : [];
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

  public hasGarageAccess(garageId?: string | null): boolean {
    if (this.role === 'SUPER_ADMIN') return true;
    if (!garageId) return false;
    return this.permittedGarageIds.includes(garageId);
  }

  public canPerform(action: 'create' | 'edit' | 'delete' | 'view'): boolean {
    if (this.role === 'SUPER_ADMIN') return true;
    switch (action) {
      case 'create':
        return this.canCreate;
      case 'edit':
        return this.canEdit;
      case 'delete':
        return this.canDelete;
      case 'view':
        return this.canView;
      default:
        return false;
    }
  }

  private validate(props: CreateEmployeeProps): void {
    if (!props.id) throw new Error('Employee ID is required.');
    if (!props.companyId) throw new Error('Company ID is required.');
    if (!props.name || props.name.trim().length < 2) throw new Error('Employee name must be at least 2 characters.');
    if (!props.address || props.address.trim().length < 3) throw new Error('Address must be at least 3 characters.');
    if (!props.email || !props.email.includes('@')) throw new Error('A valid email address is required.');
    if (!props.password) throw new Error('Password is required.');
    const hasValidPhone =
      (props.phoneNumbers && props.phoneNumbers.length > 0 && props.phoneNumbers[0].number?.trim().length >= 6) ||
      (props.phoneNumber && props.phoneNumber.trim().length >= 6);
    if (!hasValidPhone) throw new Error('Phone number is required.');
    if (!props.nidNumber || props.nidNumber.trim().length < 5) throw new Error('NID number must be at least 5 characters.');
  }
}
