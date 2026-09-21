import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { GuarantorResponseDto } from './guarantor.dto';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsOptional()
  fatherName?: string;

  @IsString()
  @IsOptional()
  motherName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @MinLength(6, { message: 'Mobile number must be at least 6 characters' })
  mobileNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'NID number is required' })
  @MinLength(6, { message: 'NID number must be at least 6 characters' })
  nidNumber: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Previous unit must be a valid number' })
  @Min(0, { message: 'Previous unit cannot be negative' })
  previousUnit: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Advance money must be a valid number' })
  advanceMoney: number;

  @IsString()
  @IsNotEmpty({ message: 'Assigned garage is required. Each customer must belong to one garage.' })
  garageId: string;

  @IsString()
  @IsOptional()
  customerCode?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

export class CustomerResponseDto {
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
  createdDate: Date;
  bills?: any[];
  guarantors?: GuarantorResponseDto[];
}

export class CustomerDashboardItemDto {
  id: string;
  cId?: number;
  customerCode?: string | null;
  name: string;
  mobileNumber: string;
  presentDues: number;
  advanceMoney: number;
  garageId?: string;
  garageName?: string;
  lastBillDate: Date;
  hasBills: boolean;
}
