import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { GarageOrmEntity } from './garage.orm-entity';
import { EmployeeOrmEntity } from './employee.orm-entity';

@Entity('companies')
export class CompanyOrmEntity extends BaseAuditableOrmEntity {
  @AutoMap()
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @AutoMap()
  @Column({ length: 100 })
  name: string;

  @AutoMap()
  @Column({ length: 150 })
  companyName: string;

  @AutoMap()
  @Index({ unique: true })
  @Column({ length: 150 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @AutoMap()
  @Column({ length: 30 })
  phoneNumber: string;

  @AutoMap()
  @Column({ type: 'varchar', length: 20, default: 'SUPER_ADMIN' })
  role: string;

  @AutoMap()
  @Column('text')
  address: string;

  @AutoMap()
  @Column('decimal', { precision: 10, scale: 2, default: 15 })
  unitRate: number;

  @AutoMap()
  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  registrationStatus: string;

  @OneToMany(() => GarageOrmEntity, (garage) => garage.company, {
    cascade: true,
  })
  garages: GarageOrmEntity[];

  @OneToMany(() => EmployeeOrmEntity, (emp) => emp.company, {
    cascade: true,
  })
  employees: EmployeeOrmEntity[];

  @OneToMany('CustomerOrmEntity', (customer: any) => customer.company, {
    cascade: true,
  })
  customers: any[];
}
