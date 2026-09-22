import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';

@Entity('audit_logs')
@Index(['companyId', 'createdDate'])
@Index(['companyId', 'action'])
@Index(['companyId', 'entityType'])
export class AuditLogOrmEntity {
  @AutoMap(() => String)
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @AutoMap(() => String)
  @Column('varchar', { length: 100 })
  companyId: string;

  @AutoMap(() => String)
  @Column('varchar', { length: 100 })
  userId: string;

  @AutoMap(() => String)
  @Column('varchar', { length: 150 })
  userName: string;

  @AutoMap(() => String)
  @Column('varchar', { length: 50, default: 'GENERAL' })
  userRole: string;

  @AutoMap(() => String)
  @Column('varchar', { length: 50 })
  action: string;

  @AutoMap(() => String)
  @Column('varchar', { length: 50 })
  entityType: string;

  @AutoMap(() => String)
  @Column('varchar', { length: 100, nullable: true, default: null })
  entityId?: string | null;

  @AutoMap(() => String)
  @Column('varchar', { length: 255, nullable: true, default: null })
  entityName?: string | null;

  @AutoMap(() => String)
  @Column('text', { nullable: true })
  details?: string | null;

  @AutoMap(() => String)
  @Column('varchar', { length: 50, nullable: true, default: null })
  ipAddress?: string | null;

  @AutoMap(() => String)
  @Column('varchar', { length: 255, nullable: true, default: null })
  userAgent?: string | null;

  @AutoMap(() => Date)
  @CreateDateColumn({ type: 'datetime' })
  createdDate: Date;
}
