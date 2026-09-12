export interface AuditableProps {
  isActive?: boolean;
  isDeleted?: boolean;
  createdBy?: string;
  editByName?: string;
  deletedBy?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  deletedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class AuditableEntity {
  public isActive: boolean;
  public isDeleted: boolean;

  // Audit stamp format: "{id}|{role}" e.g. "comp-apex-001|SUPER_ADMIN"
  public createdBy?: string;
  public editByName?: string;
  public deletedBy?: string;

  public createdDate: Date;
  public modifiedDate?: Date;
  public deletedDate?: Date;

  constructor(props?: AuditableProps) {
    this.isActive = props?.isActive ?? true;
    this.isDeleted = props?.isDeleted ?? false;
    this.createdBy = props?.createdBy;
    this.editByName = props?.editByName ?? props?.createdBy;
    this.deletedBy = props?.deletedBy;
    this.createdDate = props?.createdDate || props?.createdAt || new Date();
    this.modifiedDate = props?.modifiedDate || props?.updatedAt;
    this.deletedDate = props?.deletedDate;
  }

  public get createdAt(): Date {
    return this.createdDate;
  }

  public get updatedAt(): Date {
    return this.modifiedDate || this.createdDate;
  }


  public markModified(byStamp: string): void {
    this.editByName = byStamp;
    this.modifiedDate = new Date();
  }

  public softDelete(byStamp: string): void {
    this.isDeleted = true;
    this.isActive = false;
    this.deletedBy = byStamp;
    this.deletedDate = new Date();
    this.modifiedDate = new Date();
  }

  public restore(byStamp: string): void {
    this.isDeleted = false;
    this.isActive = true;
    this.deletedBy = undefined;
    this.deletedDate = undefined;
    this.markModified(byStamp);
  }

  public activate(byStamp?: string): void {
    this.isActive = true;
    if (byStamp) this.markModified(byStamp);
  }

  public deactivate(byStamp?: string): void {
    this.isActive = false;
    if (byStamp) this.markModified(byStamp);
  }
}
