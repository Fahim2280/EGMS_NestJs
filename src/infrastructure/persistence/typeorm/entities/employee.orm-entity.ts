import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { GarageOrmEntity } from './garage.orm-entity';

import { ContactPhone } from '../../../../domain/common/contact-phone.interface';
import { AttachedDocument } from '../../../../domain/common/attached-document.interface';

@Entity('employees')
export class EmployeeOrmEntity extends BaseAuditableOrmEntity {
  @AutoMap()
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @AutoMap()
  @Column('varchar', { length: 100 })
  companyId: string;

  @AutoMap()
  @Column({ length: 100 })
  name: string;

  @AutoMap()
  @Column('text')
  address: string;

  @AutoMap()
  @Index({ unique: true })
  @Column({ length: 150 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @AutoMap()
  @Column({ length: 30 })
  phoneNumber: string;

  @Column({ type: 'json', nullable: true })
  phoneNumbers: ContactPhone[] | null;

  @Column({ type: 'json', nullable: true })
  documents: AttachedDocument[] | null;

  @AutoMap()
  @Column({ type: 'varchar', length: 20, default: 'GENERAL' })
  role: string;

  @AutoMap()
  @Index({ unique: true })
  @Column({ length: 50 })
  nidNumber: string;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  canCreate: boolean;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  canEdit: boolean;

  @AutoMap()
  @Column({ type: 'boolean', default: false })
  canDelete: boolean;

  @AutoMap()
  @Column({ type: 'boolean', default: true })
  canView: boolean;

  @ManyToOne(() => CompanyOrmEntity, (company) => company.employees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyOrmEntity;

  @ManyToMany(() => GarageOrmEntity, (garage) => garage.employees, {
    cascade: false,
  })
  @JoinTable({
    name: 'employee_garages',
    joinColumn: { name: 'employeeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'garageId', referencedColumnName: 'id' },
  })
  permittedGarages: GarageOrmEntity[];
}
