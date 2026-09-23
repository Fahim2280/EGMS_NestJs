import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { ElectricBillOrmEntity } from './electric-bill.orm-entity';
import { GarageOrmEntity } from './garage.orm-entity';
import { GuarantorOrmEntity } from './guarantor.orm-entity';
import { ContactPhone } from '../../../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../../../domain/common/attached-document.interface';

@Entity('customers')
@Index(['companyId', 'nidNumber'])
@Index(['companyId', 'mobileNumber'])
@Index(['companyId', 'customerCode'])
export class CustomerOrmEntity extends BaseAuditableOrmEntity {
  @AutoMap()
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @AutoMap()
  @Column({ type: 'int', nullable: true })
  cId: number;

  @AutoMap(() => String)
  @Column('varchar', { length: 50, nullable: true, default: null })
  customerCode?: string | null;

  @AutoMap()
  @Column('varchar', { length: 100 })
  companyId: string;

  @AutoMap()
  @Column({ length: 150 })
  name: string;

  @AutoMap()
  @Column({ length: 150, default: '' })
  fatherName: string;

  @AutoMap()
  @Column({ length: 150, default: '' })
  motherName: string;

  @AutoMap()
  @Column('text')
  address: string;

  @AutoMap()
  @Column({ length: 30 })
  mobileNumber: string;

  @Column({ type: 'json', nullable: true })
  phoneNumbers: ContactPhone[] | null;

  @Column({ type: 'json', nullable: true })
  documents: AttachedDocument[] | null;

  @AutoMap()
  @Column({ length: 50 })
  nidNumber: string;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  previousUnit: number;

  @AutoMap()
  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  advanceMoney: number;

  @AutoMap(() => String)
  @Column('varchar', { length: 100, nullable: true })
  garageId?: string | null;

  @ManyToOne(() => GarageOrmEntity, (garage) => garage.customers, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'garageId' })
  garage: GarageOrmEntity;

  @ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: CompanyOrmEntity;

  @OneToMany(() => ElectricBillOrmEntity, (bill) => bill.customer, {
    cascade: true,
  })
  bills: ElectricBillOrmEntity[];

  @OneToMany(() => GuarantorOrmEntity, (guarantor) => guarantor.customer, {
    cascade: true,
  })
  guarantors: GuarantorOrmEntity[];
}
