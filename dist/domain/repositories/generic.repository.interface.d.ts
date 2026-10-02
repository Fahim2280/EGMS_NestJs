export interface QueryOptions {
    filter?: Record<string, any>;
    relations?: string[];
    orderBy?: Record<string, 'ASC' | 'DESC'>;
    limit?: number;
    includeDeleted?: boolean;
}
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface IGenericRepository<T> {
    getAllAsync(options?: QueryOptions): Promise<T[]>;
    getByIdAsync(id: string, relations?: string[]): Promise<T | null>;
    getFirstOrDefaultAsync(filter: Record<string, any>, relations?: string[]): Promise<T | null>;
    addAsync(entity: T): Promise<T>;
    updateAsync(entity: T): Promise<T>;
    deleteAsync(id: string): Promise<boolean>;
    softDeleteAsync(id: string, deletedByStamp?: string): Promise<boolean>;
    existsAsync(filter: Record<string, any>): Promise<boolean>;
    countAsync(filter?: Record<string, any>): Promise<number>;
    getPagedAsync(page: number, pageSize: number, options?: QueryOptions): Promise<PagedResult<T>>;
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    save(entity: T): Promise<void>;
    count(filter?: Record<string, any>): Promise<number>;
    delete(id: string): Promise<boolean>;
}
