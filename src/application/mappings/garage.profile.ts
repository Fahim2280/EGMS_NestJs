import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Garage } from '@domain/entities/garage.entity';
import { GarageResponseDto } from '../dtos/garage.dto';

@Injectable()
export class GarageProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Garage,
        GarageResponseDto,
        forMember((d) => d.id, mapFrom((s) => s.id)),
        forMember((d) => d.garageName, mapFrom((s) => s.garageName)),
        forMember((d) => d.address, mapFrom((s) => s.address)),
        forMember((d) => d.companyId, mapFrom((s) => s.companyId)),
        forMember((d) => d.isActive, mapFrom((s) => s.isActive)),
        forMember((d) => d.createdDate, mapFrom((s) => s.createdDate)),
        forMember((d) => d.modifiedDate, mapFrom((s) => s.modifiedDate)),
        forMember((d) => d.createdBy, mapFrom((s) => s.createdBy)),
        forMember((d) => d.editByName, mapFrom((s) => s.editByName)),
        forMember(
          (d) => d.createdAt,
          mapFrom((s) =>
            s.createdDate
              ? new Date(s.createdDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '',
          ),
        ),
        forMember(
          (d) => d.updatedAt,
          mapFrom((s) =>
            s.modifiedDate || s.createdDate
              ? new Date(s.modifiedDate || s.createdDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '',
          ),
        ),
      );
    };

  }
}
