import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class RegisterCompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'Owner / Contact name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  companyName: string;

  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @MinLength(6, { message: 'Phone number must be at least 6 characters' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsString()
  @IsOptional()
  initialGarageName?: string;

  @IsString()
  @IsOptional()
  initialGarageAddress?: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  companyName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class CompanyResponseDto {
  @AutoMap()
  id: string;

  @AutoMap()
  name: string;

  @AutoMap()
  companyName: string;

  @AutoMap()
  email: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  role: string;

  @AutoMap()
  address: string;

  @AutoMap()
  isActive: boolean;

  @AutoMap()
  createdAt: string;

  @AutoMap()
  updatedAt: string;

  createdDate?: Date;
  modifiedDate?: Date;
  createdBy?: string;
  editByName?: string;

  garages?: any[];
  employeeCount?: number;
}

