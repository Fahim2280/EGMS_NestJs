import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { CustomerOrmEntity } from './customer.orm-entity';

@Entity('electric_bills')
@Index(['companyId', 'date'])
@Index(['customerId', 'date'])
export class ElectricBillOrmEntity extends BaseAuditableOrmEntity {
  @AutoMap()
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @AutoMap()
  @Column({ type: 'int', nullable: true })
  billNumber: number;

  @AutoMap()
  @Column('varchar', { length: 100 })
  customerId: string;

  @AutoMap()
  @Column('varchar', { length: 100 })
  companyId: string;

  @AutoMap()
  @Column('datetime')
  date: Date;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  previousUnit: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  currentUnit: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  totalUnit: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  electricBill: number;

  @AutoMap()
  @Column('decimal', { precision: 10, scale: 2, default: 15 })
  unitRate: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  previousDues: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  rentBill: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  loan: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  totalBill: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  clearMoney: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  presentDues: number;

  @ManyToOne(() => CustomerOrmEntity, (customer) => customer.bills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: CustomerOrmEntity;

  @ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: CompanyOrmEntity;
}
