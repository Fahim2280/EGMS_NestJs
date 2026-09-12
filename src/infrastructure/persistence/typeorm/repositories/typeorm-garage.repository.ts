import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Garage, IGarageRepository } from '@domain/index';
import { GarageOrmEntity } from '../entities/garage.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';

@Injectable()
export class TypeOrmGarageRepository
  extends GenericTypeOrmRepository<Garage, GarageOrmEntity>
  implements IGarageRepository
{
  constructor(
    @InjectRepository(GarageOrmEntity)
    private readonly garageRepo: Repository<GarageOrmEntity>,
  ) {
    super(garageRepo);
  }

  async findByCompanyId(companyId: string): Promise<Garage[]> {
    return this.getAllAsync({ filter: { companyId } });
  }

  protected toDomain(orm: GarageOrmEntity): Garage {
    return new Garage({
      id: orm.id,
      garageName: orm.garageName,
      address: orm.address,
      companyId: orm.companyId,
      isActive: orm.isActive,
      isDeleted: orm.isDeleted,
      createdBy: orm.createdBy,
      editByName: orm.editByName,
      deletedBy: orm.deletedBy,
      createdDate: orm.createdDate ? new Date(orm.createdDate) : new Date(),
      modifiedDate: orm.modifiedDate ? new Date(orm.modifiedDate) : undefined,
      deletedDate: orm.deletedDate ? new Date(orm.deletedDate) : undefined,
    });
  }

  protected toOrm(domain: Garage): GarageOrmEntity {
    const orm = new GarageOrmEntity();
    orm.id = domain.id;
    orm.garageName = domain.garageName;
    orm.address = domain.address;
    orm.companyId = domain.companyId;
    orm.isActive = domain.isActive;
    orm.isDeleted = domain.isDeleted;
    orm.createdBy = domain.createdBy;
    orm.editByName = domain.editByName;
    orm.deletedBy = domain.deletedBy;
    orm.createdDate = domain.createdDate;
    orm.modifiedDate = domain.modifiedDate;
    orm.deletedDate = domain.deletedDate;
    return orm;
  }
}
