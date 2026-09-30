import { AuditableEntity, AuditableProps } from '../common/auditable.entity';

export interface CreateGarageProps extends AuditableProps {
  id: string;
  garageName: string;
  address: string;
  companyId: string;
}

export class Garage extends AuditableEntity {
  public readonly id: string;
  public garageName: string;
  public address: string;
  public readonly companyId: string;

  constructor(props: CreateGarageProps) {
    super(props);
    this.validate(props);
    this.id = props.id;
    this.garageName = props.garageName.trim();
    this.address = props.address.trim();
    this.companyId = props.companyId;
  }

  public static create(props: CreateGarageProps): Garage {
    return new Garage({
      ...props,
      isActive: true,
      isDeleted: false,
      createdDate: new Date(),
    });
  }

  public updateDetails(garageName: string, address: string, updatedByStamp?: string): void {
    if (!garageName || garageName.trim().length < 2) throw new Error('Garage name must be at least 2 characters.');
    if (!address || address.trim().length < 3) throw new Error('Address must be at least 3 characters.');
    this.garageName = garageName.trim();
    this.address = address.trim();
    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
  }

  public toggleStatus(byStamp?: string): boolean {
    this.isActive = !this.isActive;
    if (byStamp) {
      this.markModified(byStamp);
    } else {
      this.modifiedDate = new Date();
    }
    return this.isActive;
  }

  private validate(props: CreateGarageProps): void {
    if (!props.id) throw new Error('Garage ID is required.');
    if (!props.companyId) throw new Error('Company ID is required.');
    if (!props.garageName || props.garageName.trim().length < 2) throw new Error('Garage name must be at least 2 characters.');
    if (!props.address || props.address.trim().length < 3) throw new Error('Address must be at least 3 characters.');
  }
}
