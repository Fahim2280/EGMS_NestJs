import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreateEmployeeDto {
  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Employee name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MinLength(3, { message: 'Address must be at least 3 characters' })
  address: string;

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
  @IsNotEmpty({ message: 'NID Number is required' })
  @MinLength(5, { message: 'NID Number must be at least 5 characters' })
  nidNumber: string;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  address?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  nidNumber?: string;
}

export class EmployeeResponseDto {
  @AutoMap()
  id: string;

  @AutoMap()
  companyId: string;

  @AutoMap()
  name: string;

  @AutoMap()
  address: string;

  @AutoMap()
  email: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  role: string;

  @AutoMap()
  nidNumber: string;

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

  companyName?: string;
}

