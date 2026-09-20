import { AuditableEntity, AuditableProps } from '../common/auditable.entity';

export interface CreateElectricBillProps extends AuditableProps {
  id: string;
  billNumber?: number;
  customerId: string;
  companyId: string;
  date: Date;
  previousUnit: number;
  currentUnit: number;
  totalUnit: number;
  electricBill: number;
  previousDues: number;
  rentBill: number;
  loan: number;
  totalBill: number;
  clearMoney: number;
  presentDues: number;
  unitRate?: number;
}

export class ElectricBill extends AuditableEntity {
  public readonly id: string;
  public billNumber?: number;
  public customerId: string;
  public companyId: string;
  public date: Date;
  public previousUnit: number;
  public currentUnit: number;
  public totalUnit: number;
  public electricBill: number;
  public previousDues: number;
  public rentBill: number;
  public loan: number;
  public totalBill: number;
  public clearMoney: number;
  public presentDues: number;
  public unitRate: number;

  constructor(props: CreateElectricBillProps) {
    super(props);
    this.validate(props);
    this.id = props.id;
    this.billNumber = props.billNumber;
    this.customerId = props.customerId;
    this.companyId = props.companyId;
    this.date = props.date ? new Date(props.date) : new Date();
    this.previousUnit = Number(props.previousUnit) || 0;
    this.currentUnit = Number(props.currentUnit) || 0;
    this.totalUnit = Number(props.totalUnit) || 0;
    this.electricBill = Number(props.electricBill) || 0;
    this.previousDues = Number(props.previousDues) || 0;
    this.rentBill = Number(props.rentBill) || 0;
    this.loan = Number(props.loan) || 0;
    this.totalBill = Number(props.totalBill) || 0;
    this.clearMoney = Number(props.clearMoney) || 0;
    this.presentDues = Number(props.presentDues) || 0;
    this.unitRate = props.unitRate !== undefined && props.unitRate !== null ? Number(props.unitRate) : 15;
  }

  public static create(props: CreateElectricBillProps): ElectricBill {
    return new ElectricBill({
      ...props,
      isActive: true,
      isDeleted: false,
      createdDate: props.createdDate || new Date(),
    });
  }

  public recalculate(
    previousUnit: number,
    previousDues: number,
    ratePerUnit?: number,
    updatedByStamp?: string,
  ): void {
    const effectiveRate =
      ratePerUnit !== undefined && ratePerUnit !== null
        ? Number(ratePerUnit)
        : (this.unitRate || 15);
    this.unitRate = effectiveRate;
    this.previousUnit = Number(previousUnit) || 0;
    this.totalUnit = Math.max(0, this.currentUnit - this.previousUnit);
    this.electricBill = this.totalUnit * effectiveRate;
    this.previousDues = Number(previousDues) || 0;
    this.totalBill = this.previousDues + this.electricBill + this.rentBill + this.loan;
    this.presentDues = this.totalBill - this.clearMoney;

    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
  }

  public updateValues(
    currentUnit: number,
    rentBill: number,
    loan: number,
    clearMoney: number,
    date?: Date,
    unitRate?: number,
    updatedByStamp?: string,
  ): void {
    this.currentUnit = Number(currentUnit) || 0;
    this.rentBill = Number(rentBill) || 0;
    this.loan = Number(loan) || 0;
    this.clearMoney = Number(clearMoney) || 0;
    if (unitRate !== undefined && unitRate !== null) {
      this.unitRate = Number(unitRate);
    }
    if (date) this.date = new Date(date);

    if (updatedByStamp) {
      this.markModified(updatedByStamp);
    } else {
      this.modifiedDate = new Date();
    }
  }

  private validate(props: CreateElectricBillProps): void {
    if (!props.id) throw new Error('Electric bill ID is required.');
    if (!props.customerId) throw new Error('Customer ID is required.');
    if (!props.companyId) throw new Error('Company ID is required.');
  }
}
