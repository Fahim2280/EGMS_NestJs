import { FindOptionsWhere, Repository } from 'typeorm';
import {
  AuditableEntity,
  IGenericRepository,
  PagedResult,
  QueryOptions,
} from '@domain/index';
import { BaseAuditableOrmEntity } from '../entities/base-auditable.orm-entity';

export abstract class GenericTypeOrmRepository<
  TDomain extends AuditableEntity,
  TOrm extends BaseAuditableOrmEntity & { id: string },
> implements IGenericRepository<TDomain> {
  constructor(protected readonly repository: Repository<TOrm>) {}

  protected abstract toDomain(orm: TOrm): TDomain;
  protected abstract toOrm(domain: TDomain): TOrm;

  protected parseRelations(relations?: any): Record<string, boolean> | undefined {
    if (!relations) return undefined;
    if (Array.isArray(relations)) {
      if (relations.length === 0) return undefined;
      return relations.reduce((acc, rel) => {
        if (typeof rel === 'string' && rel.trim().length > 0) {
          acc[rel.trim()] = true;
        }
        return acc;
      }, {} as Record<string, boolean>);
    }
    if (typeof relations === 'object') {
      return relations;
    }
    return undefined;
  }

  async getAllAsync(options?: QueryOptions): Promise<TDomain[]> {
    const where: FindOptionsWhere<TOrm> = (options?.filter || {}) as FindOptionsWhere<TOrm>;

    if (!options?.includeDeleted) {
      (where as any).isDeleted = false;
    }

    const ormList = await this.repository.find({
      where,
      relations: this.parseRelations(options?.relations) as any,
      order: (options?.orderBy || { createdDate: 'DESC' }) as any,
      take: options?.limit || 1000,
    });

    return ormList.map((orm) => this.toDomain(orm));
  }

  async getByIdAsync(id: string, relations?: string[]): Promise<TDomain | null> {
    const orm = await this.repository.findOne({
      where: { id, isDeleted: false } as any,
      relations: this.parseRelations(relations) as any,
    });
    return orm ? this.toDomain(orm) : null;
  }

  async getFirstOrDefaultAsync(
    filter: Record<string, any>,
    relations?: string[],
  ): Promise<TDomain | null> {
    const where = { ...filter };
    if (where.isDeleted === undefined) {
      where.isDeleted = false;
    }

    const orm = await this.repository.findOne({
      where: where as any,
      relations: this.parseRelations(relations) as any,
    });
    return orm ? this.toDomain(orm) : null;
  }

  async addAsync(entity: TDomain): Promise<TDomain> {
    const orm = this.toOrm(entity);
    await this.repository.save(orm);
    return entity;
  }

  async updateAsync(entity: TDomain): Promise<TDomain> {
    const orm = this.toOrm(entity);
    await this.repository.save(orm);
    return entity;
  }

  async deleteAsync(id: string): Promise<boolean> {
    const res = await this.repository.delete(id);
    return (res.affected ?? 0) > 0;
  }

  async softDeleteAsync(id: string, deletedByStamp?: string): Promise<boolean> {
    const orm = await this.repository.findOne({ where: { id } as any });
    if (!orm) return false;

    orm.isDeleted = true;
    orm.isActive = false;
    orm.deletedBy = deletedByStamp;
    orm.deletedDate = new Date();
    orm.modifiedDate = new Date();

    await this.repository.save(orm);
    return true;
  }

  async existsAsync(filter: Record<string, any>): Promise<boolean> {
    const where = { ...filter };
    if (where.isDeleted === undefined) {
      where.isDeleted = false;
    }
    return this.repository.exists({ where: where as any });
  }

  async countAsync(filter?: Record<string, any>): Promise<number> {
    const where = { ...(filter || {}) };
    if (where.isDeleted === undefined) {
      where.isDeleted = false;
    }
    return this.repository.count({ where: where as any });
  }

  async getPagedAsync(
    page: number,
    pageSize: number,
    options?: QueryOptions,
  ): Promise<PagedResult<TDomain>> {
    const safePage = page < 1 ? 1 : page;
    const safePageSize = Math.min(Math.max(pageSize, 1), 500);

    const where: FindOptionsWhere<TOrm> = (options?.filter || {}) as FindOptionsWhere<TOrm>;
    if (!options?.includeDeleted) {
      (where as any).isDeleted = false;
    }

    const [items, totalCount] = await this.repository.findAndCount({
      where,
      relations: this.parseRelations(options?.relations) as any,
      order: (options?.orderBy || { createdDate: 'DESC' }) as any,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    });

    const totalPages = Math.ceil(totalCount / safePageSize);

    return {
      items: items.map((orm) => this.toDomain(orm)),
      totalCount,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
    };
  }

  // Compatibility aliases
  async findById(id: string): Promise<TDomain | null> {
    return this.getByIdAsync(id);
  }

  async findAll(): Promise<TDomain[]> {
    return this.getAllAsync();
  }

  async save(entity: TDomain): Promise<void> {
    const orm = this.toOrm(entity);
    await this.repository.save(orm);
  }

  async count(filter?: Record<string, any>): Promise<number> {
    return this.countAsync(filter);
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteAsync(id);
  }
}

