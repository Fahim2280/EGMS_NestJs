import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateElectricBillDto {
  @IsString()
  @IsNotEmpty({ message: 'Customer selection is required' })
  customerId: string;

  @IsOptional()
  date?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Current unit must be a valid number' })
  @Min(0, { message: 'Current unit cannot be negative' })
  currentUnit: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Rent bill must be a valid number' })
  @Min(0, { message: 'Rent bill cannot be negative' })
  rentBill: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Loan must be a valid number' })
  @Min(0, { message: 'Loan cannot be negative' })
  loan: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Clear money (paid amount) must be a valid number' })
  @Min(0, { message: 'Clear money cannot be negative' })
  clearMoney: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Electricity rate per unit must be a valid number' })
  @Min(0.01, { message: 'Electricity rate must be greater than 0' })
  unitRate?: number;
}

export class UpdateElectricBillDto {
  @IsString()
  @IsNotEmpty({ message: 'Bill ID is required' })
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer selection is required' })
  customerId: string;

  @IsOptional()
  date?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Current unit must be a valid number' })
  @Min(0, { message: 'Current unit cannot be negative' })
  currentUnit: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Rent bill must be a valid number' })
  @Min(0, { message: 'Rent bill cannot be negative' })
  rentBill: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Loan must be a valid number' })
  @Min(0, { message: 'Loan cannot be negative' })
  loan: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Clear money must be a valid number' })
  @Min(0, { message: 'Clear money cannot be negative' })
  clearMoney: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Electricity rate per unit must be a valid number' })
  @Min(0.01, { message: 'Electricity rate must be greater than 0' })
  unitRate?: number;
}

export class ElectricBillResponseDto {
  id: string;
  billNumber?: number;
  customerId: string;
  customerName?: string;
  customerCode?: string | null;
  customerCId?: number;
  garageId?: string;
  garageName?: string;
  companyId: string;
  date: Date;
  previousUnit: number;
  currentUnit: number;
  totalUnit: number;
  electricBill: number;
  unitRate?: number;
  previousDues: number;
  rentBill: number;
  loan: number;
  totalBill: number;
  clearMoney: number;
  presentDues: number;
}

export class ElectricBillPreviewDto {
  customerId: string;
  customerName: string;
  previousMeterReading: number;
  currentMeterReading: number;
  consumedUnits: number;
  electricBill: number;
  unitRate?: number;
  rentBill: number;
  loan: number;
  previousDues: number;
  totalBill: number;
}

export class CustomerBillSummaryDto {
  customerId: string;
  customerName: string;
  lastMeterReading: number;
  previousDues: number;
  lastBillDate: Date | null;
}

export class PreviewBillRequestDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @Type(() => Number)
  @IsNumber()
  currentMeterReading: number;

  @Type(() => Number)
  @IsNumber()
  rentBill: number;

  @Type(() => Number)
  @IsNumber()
  loan: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  unitRate?: number;
}
