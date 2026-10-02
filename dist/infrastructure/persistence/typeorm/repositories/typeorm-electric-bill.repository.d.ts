import { Repository } from 'typeorm';
import { ElectricBill, IElectricBillRepository } from "../../../../domain/index";
import { ElectricBillOrmEntity } from '../entities/electric-bill.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';
export declare class TypeOrmElectricBillRepository extends GenericTypeOrmRepository<ElectricBill, ElectricBillOrmEntity> implements IElectricBillRepository {
    private readonly billRepo;
    constructor(billRepo: Repository<ElectricBillOrmEntity>);
    findByCustomerId(customerId: string): Promise<ElectricBill[]>;
    findLatestByCustomerId(customerId: string): Promise<ElectricBill | null>;
    findPreviousBill(customerId: string, beforeDate: Date, excludeBillId?: string): Promise<ElectricBill | null>;
    findSubsequentBills(customerId: string, afterDate: Date): Promise<ElectricBill[]>;
    findByCompanyId(companyId: string): Promise<ElectricBill[]>;
    findByGarageId(companyId: string, garageId: string): Promise<ElectricBill[]>;
    protected toDomain(orm: ElectricBillOrmEntity): ElectricBill;
    protected toOrm(domain: ElectricBill): ElectricBillOrmEntity;
}
