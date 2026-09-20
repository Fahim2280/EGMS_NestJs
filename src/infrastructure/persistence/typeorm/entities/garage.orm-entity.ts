import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { CustomerOrmEntity } from './customer.orm-entity';

@Entity('garages')
export class GarageOrmEntity extends BaseAuditableOrmEntity {
  @AutoMap()
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @AutoMap()
  @Column({ length: 150 })
  garageName: string;

  @AutoMap()
  @Column('text')
  address: string;

  @AutoMap()
  @Column('varchar', { length: 100 })
  companyId: string;

  @ManyToOne(() => CompanyOrmEntity, (company) => company.garages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyOrmEntity;

  @OneToMany(() => CustomerOrmEntity, (customer) => customer.garage)
  customers: CustomerOrmEntity[];
}
