"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericTypeOrmRepository = void 0;
class GenericTypeOrmRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    parseRelations(relations) {
        if (!relations)
            return undefined;
        if (Array.isArray(relations)) {
            if (relations.length === 0)
                return undefined;
            return relations.reduce((acc, rel) => {
                if (typeof rel === 'string' && rel.trim().length > 0) {
                    acc[rel.trim()] = true;
                }
                return acc;
            }, {});
        }
        if (typeof relations === 'object') {
            return relations;
        }
        return undefined;
    }
    async getAllAsync(options) {
        const where = (options?.filter || {});
        if (!options?.includeDeleted) {
            where.isDeleted = false;
        }
        const ormList = await this.repository.find({
            where,
            relations: this.parseRelations(options?.relations),
            order: (options?.orderBy || { createdDate: 'DESC' }),
            take: options?.limit || 1000,
        });
        return ormList.map((orm) => this.toDomain(orm));
    }
    async getByIdAsync(id, relations) {
        const orm = await this.repository.findOne({
            where: { id, isDeleted: false },
            relations: this.parseRelations(relations),
        });
        return orm ? this.toDomain(orm) : null;
    }
    async getFirstOrDefaultAsync(filter, relations) {
        const where = { ...filter };
        if (where.isDeleted === undefined) {
            where.isDeleted = false;
        }
        const orm = await this.repository.findOne({
            where: where,
            relations: this.parseRelations(relations),
        });
        return orm ? this.toDomain(orm) : null;
    }
    async addAsync(entity) {
        const orm = this.toOrm(entity);
        await this.repository.save(orm);
        return entity;
    }
    async updateAsync(entity) {
        const orm = this.toOrm(entity);
        await this.repository.save(orm);
        return entity;
    }
    async deleteAsync(id) {
        const res = await this.repository.delete(id);
        return (res.affected ?? 0) > 0;
    }
    async softDeleteAsync(id, deletedByStamp) {
        const orm = await this.repository.findOne({ where: { id } });
        if (!orm)
            return false;
        orm.isDeleted = true;
        orm.isActive = false;
        orm.deletedBy = deletedByStamp;
        orm.deletedDate = new Date();
        orm.modifiedDate = new Date();
        await this.repository.save(orm);
        return true;
    }
    async existsAsync(filter) {
        const where = { ...filter };
        if (where.isDeleted === undefined) {
            where.isDeleted = false;
        }
        return this.repository.exists({ where: where });
    }
    async countAsync(filter) {
        const where = { ...(filter || {}) };
        if (where.isDeleted === undefined) {
            where.isDeleted = false;
        }
        return this.repository.count({ where: where });
    }
    async getPagedAsync(page, pageSize, options) {
        const safePage = page < 1 ? 1 : page;
        const safePageSize = Math.min(Math.max(pageSize, 1), 500);
        const where = (options?.filter || {});
        if (!options?.includeDeleted) {
            where.isDeleted = false;
        }
        const [items, totalCount] = await this.repository.findAndCount({
            where,
            relations: this.parseRelations(options?.relations),
            order: (options?.orderBy || { createdDate: 'DESC' }),
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
    async findById(id) {
        return this.getByIdAsync(id);
    }
    async findAll() {
        return this.getAllAsync();
    }
    async save(entity) {
        const orm = this.toOrm(entity);
        await this.repository.save(orm);
    }
    async count(filter) {
        return this.countAsync(filter);
    }
    async delete(id) {
        return this.deleteAsync(id);
    }
}
exports.GenericTypeOrmRepository = GenericTypeOrmRepository;
//# sourceMappingURL=generic-typeorm.repository.js.map