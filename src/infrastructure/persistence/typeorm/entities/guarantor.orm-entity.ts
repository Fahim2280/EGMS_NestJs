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

@Entity('guarantors')
@Index(['companyId', 'customerId'])
@Index(['companyId', 'nidNumber'])
export class GuarantorOrmEntity extends BaseAuditableOrmEntity {
  @AutoMap()
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @AutoMap()
  @Column('varchar', { length: 100 })
  customerId: string;

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
  @Column({ length: 30 })
  mobileNumber: string;

  @AutoMap()
  @Column({ length: 50 })
  nidNumber: string;

  @AutoMap()
  @Column('text')
  address: string;

  @AutoMap()
  @Column({ length: 100, default: '' })
  relationship: string;

  @ManyToOne(() => CustomerOrmEntity, (customer) => customer.guarantors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: CustomerOrmEntity;

  @ManyToOne(() => CompanyOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: CompanyOrmEntity;
}
