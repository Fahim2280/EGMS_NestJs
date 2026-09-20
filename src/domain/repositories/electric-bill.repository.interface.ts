import { ElectricBill } from '../entities/electric-bill.entity';
import { IGenericRepository } from './generic.repository.interface';

export const ELECTRIC_BILL_REPOSITORY_TOKEN = 'ELECTRIC_BILL_REPOSITORY_TOKEN';

export interface IElectricBillRepository extends IGenericRepository<ElectricBill> {
  findByCustomerId(customerId: string): Promise<ElectricBill[]>;
  findLatestByCustomerId(customerId: string): Promise<ElectricBill | null>;
  findPreviousBill(customerId: string, beforeDate: Date, excludeBillId?: string): Promise<ElectricBill | null>;
  findSubsequentBills(customerId: string, afterDate: Date): Promise<ElectricBill[]>;
  findByCompanyId(companyId: string): Promise<ElectricBill[]>;
  findByGarageId(companyId: string, garageId: string): Promise<ElectricBill[]>;
}
