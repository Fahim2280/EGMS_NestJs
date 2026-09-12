import { Garage } from '../entities/garage.entity';
import { IGenericRepository } from './generic.repository.interface';

export const GARAGE_REPOSITORY_TOKEN = 'GARAGE_REPOSITORY_TOKEN';

export interface IGarageRepository extends IGenericRepository<Garage> {
  findByCompanyId(companyId: string): Promise<Garage[]>;
}
