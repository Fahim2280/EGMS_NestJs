import { Repository } from 'typeorm';
import { AuditableEntity, IGenericRepository, PagedResult, QueryOptions } from "../../../../domain/index";
import { BaseAuditableOrmEntity } from '../entities/base-auditable.orm-entity';
export declare abstract class GenericTypeOrmRepository<TDomain extends AuditableEntity, TOrm extends BaseAuditableOrmEntity & {
    id: string;
}> implements IGenericRepository<TDomain> {
    protected readonly repository: Repository<TOrm>;
    constructor(repository: Repository<TOrm>);
    protected abstract toDomain(orm: TOrm): TDomain;
    protected abstract toOrm(domain: TDomain): TOrm;
    protected parseRelations(relations?: any): Record<string, boolean> | undefined;
    getAllAsync(options?: QueryOptions): Promise<TDomain[]>;
    getByIdAsync(id: string, relations?: string[]): Promise<TDomain | null>;
    getFirstOrDefaultAsync(filter: Record<string, any>, relations?: string[]): Promise<TDomain | null>;
    addAsync(entity: TDomain): Promise<TDomain>;
    updateAsync(entity: TDomain): Promise<TDomain>;
    deleteAsync(id: string): Promise<boolean>;
    softDeleteAsync(id: string, deletedByStamp?: string): Promise<boolean>;
    existsAsync(filter: Record<string, any>): Promise<boolean>;
    countAsync(filter?: Record<string, any>): Promise<number>;
    getPagedAsync(page: number, pageSize: number, options?: QueryOptions): Promise<PagedResult<TDomain>>;
    findById(id: string): Promise<TDomain | null>;
    findAll(): Promise<TDomain[]>;
    save(entity: TDomain): Promise<void>;
    count(filter?: Record<string, any>): Promise<number>;
    delete(id: string): Promise<boolean>;
}
