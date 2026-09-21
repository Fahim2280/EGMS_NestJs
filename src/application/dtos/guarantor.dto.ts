import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGuarantorDto {
  @IsString()
  @IsNotEmpty({ message: 'Guarantor name is required.' })
  @MinLength(2, { message: 'Name must be at least 2 characters.' })
  name: string;

  @IsString()
  @IsOptional()
  fatherName?: string;

  @IsString()
  @IsOptional()
  motherName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required.' })
  @MinLength(6, { message: 'Mobile number must be at least 6 characters.' })
  mobileNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'NID number is required.' })
  @MinLength(6, { message: 'NID number must be at least 6 characters.' })
  nidNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required.' })
  address: string;

  @IsString()
  @IsOptional()
  relationship?: string;
}

export class UpdateGuarantorDto extends CreateGuarantorDto {}

export class GuarantorResponseDto {
  id: string;
  customerId: string;
  companyId: string;
  name: string;
  fatherName: string;
  motherName: string;
  address: string;
  mobileNumber: string;
  nidNumber: string;
  relationship: string;
  createdDate: Date;
}
