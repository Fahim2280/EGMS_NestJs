import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';

export abstract class BaseAuditableOrmEntity {
  @AutoMap()
  @Column({ default: true })
  isActive: boolean;

  @AutoMap()
  @Column({ default: false })
  isDeleted: boolean;

  @AutoMap()
  @Column({ nullable: true, length: 150 })
  createdBy?: string;

  @AutoMap()
  @Column({ nullable: true, length: 150 })
  editByName?: string;

  @AutoMap()
  @Column({ nullable: true, length: 150 })
  deletedBy?: string;

  @AutoMap()
  @CreateDateColumn()
  createdDate: Date;

  @AutoMap()
  @UpdateDateColumn({ nullable: true })
  modifiedDate?: Date;

  @AutoMap()
  @Column({ nullable: true, type: 'datetime' })
  deletedDate?: Date;
}
