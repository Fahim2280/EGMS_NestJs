export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'PERMISSIONS_UPDATE';

export type AuditEntityType =
  | 'AUTH'
  | 'CUSTOMER'
  | 'ELECTRIC_BILL'
  | 'GARAGE'
  | 'EMPLOYEE'
  | 'COMPANY'
  | 'GUARANTOR';

export interface CreateAuditLogProps {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction | string;
  entityType: AuditEntityType | string;
  entityId?: string | null;
  entityName?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdDate?: Date;
}

export class AuditLog {
  public readonly id: string;
  public readonly companyId: string;
  public readonly userId: string;
  public readonly userName: string;
  public readonly userRole: string;
  public readonly action: string;
  public readonly entityType: string;
  public readonly entityId?: string | null;
  public readonly entityName?: string | null;
  public readonly details?: string | null;
  public readonly ipAddress?: string | null;
  public readonly userAgent?: string | null;
  public readonly createdDate: Date;

  constructor(props: CreateAuditLogProps) {
    if (!props.id) throw new Error('AuditLog ID is required.');
    if (!props.companyId) throw new Error('Company ID is required.');
    if (!props.userId) throw new Error('User ID is required.');
    if (!props.action) throw new Error('Action is required.');
    if (!props.entityType) throw new Error('Entity type is required.');

    this.id = props.id;
    this.companyId = props.companyId;
    this.userId = props.userId;
    this.userName = props.userName || 'System';
    this.userRole = props.userRole || 'GENERAL';
    this.action = props.action.toUpperCase();
    this.entityType = props.entityType.toUpperCase();
    this.entityId = props.entityId || null;
    this.entityName = props.entityName || null;
    this.details = props.details || null;
    this.ipAddress = props.ipAddress || null;
    this.userAgent = props.userAgent || null;
    this.createdDate = props.createdDate || new Date();
  }

  public static create(props: CreateAuditLogProps): AuditLog {
    return new AuditLog(props);
  }
}
