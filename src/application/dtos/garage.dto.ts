import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreateGarageDto {
  @IsString()
  @IsNotEmpty({ message: 'Garage name is required' })
  @MinLength(2, { message: 'Garage name must be at least 2 characters' })
  garageName: string;

  @IsString()
  @IsNotEmpty({ message: 'Garage address is required' })
  @MinLength(3, { message: 'Address must be at least 3 characters' })
  address: string;

  @IsString()
  @IsOptional()
  companyId?: string;
}

export class UpdateGarageDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  garageName?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  address?: string;
}

export class GarageResponseDto {
  @AutoMap()
  id: string;

  @AutoMap()
  garageName: string;

  @AutoMap()
  address: string;

  @AutoMap()
  companyId: string;

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
  customerCount?: number;
}

export class GarageMetricsDto {
  totalCustomers: number;
  totalUnitsConsumed: number;
  totalElectricAmount: number;
  totalBilledAmount: number;
  totalCollectedRevenue: number;
  totalOutstandingDues: number;
  averageUnitsPerCustomer: number;
}

export class GarageDashboardDto {
  garage: GarageResponseDto;
  metrics: GarageMetricsDto;
  customers: any[];
  recentBills: any[];
}

