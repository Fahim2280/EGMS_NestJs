import { Guarantor } from '../entities/guarantor.entity';
import { IGenericRepository } from './generic.repository.interface';

export const GUARANTOR_REPOSITORY_TOKEN = Symbol('IGuarantorRepository');

export interface IGuarantorRepository extends IGenericRepository<Guarantor> {
  findByCustomerId(customerId: string): Promise<Guarantor[]>;
  findByEmployeeId(employeeId: string): Promise<Guarantor[]>;
  findByCompanyId(companyId: string): Promise<Guarantor[]>;
  countByCustomerId(customerId: string): Promise<number>;
  countByEmployeeId(employeeId: string): Promise<number>;
  findByCustomerAndNid(customerId: string, nidNumber: string, excludeId?: string): Promise<Guarantor | null>;
  findByEmployeeAndNid(employeeId: string, nidNumber: string, excludeId?: string): Promise<Guarantor | null>;
}
