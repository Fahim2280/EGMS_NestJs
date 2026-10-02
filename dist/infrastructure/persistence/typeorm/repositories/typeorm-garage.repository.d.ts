import { Repository } from 'typeorm';
import { Garage, IGarageRepository } from "../../../../domain/index";
import { GarageOrmEntity } from '../entities/garage.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';
export declare class TypeOrmGarageRepository extends GenericTypeOrmRepository<Garage, GarageOrmEntity> implements IGarageRepository {
    private readonly garageRepo;
    constructor(garageRepo: Repository<GarageOrmEntity>);
    findByCompanyId(companyId: string): Promise<Garage[]>;
    protected toDomain(orm: GarageOrmEntity): Garage;
    protected toOrm(domain: Garage): GarageOrmEntity;
}
