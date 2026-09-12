import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Company } from '@domain/entities/company.entity';
import { CompanyResponseDto } from '../dtos/company.dto';

@Injectable()
export class CompanyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Company,
        CompanyResponseDto,
        forMember((d) => d.id, mapFrom((s) => s.id)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
        forMember((d) => d.companyName, mapFrom((s) => s.companyName)),
        forMember((d) => d.email, mapFrom((s) => s.email)),
        forMember((d) => d.phoneNumber, mapFrom((s) => s.phoneNumber)),
        forMember((d) => d.role, mapFrom((s) => s.role)),
        forMember((d) => d.address, mapFrom((s) => s.address)),
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
