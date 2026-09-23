import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Employee } from '@domain/entities/employee.entity';
import { EmployeeResponseDto } from '../dtos/employee.dto';

@Injectable()
export class EmployeeProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Employee,
        EmployeeResponseDto,
        forMember((d) => d.id, mapFrom((s) => s.id)),
        forMember((d) => d.companyId, mapFrom((s) => s.companyId)),
        forMember((d) => d.name, mapFrom((s) => s.name)),
        forMember((d) => d.address, mapFrom((s) => s.address)),
        forMember((d) => d.email, mapFrom((s) => s.email)),
        forMember((d) => d.phoneNumber, mapFrom((s) => s.phoneNumber)),
        forMember((d) => d.phoneNumbers, mapFrom((s) => s.phoneNumbers || [])),
        forMember((d) => d.documents, mapFrom((s) => s.documents || [])),
        forMember((d) => d.role, mapFrom((s) => s.role)),
        forMember((d) => d.nidNumber, mapFrom((s) => s.nidNumber)),
        forMember((d) => d.isActive, mapFrom((s) => s.isActive)),
        forMember((d) => d.canCreate, mapFrom((s) => s.canCreate)),
        forMember((d) => d.canEdit, mapFrom((s) => s.canEdit)),
        forMember((d) => d.canDelete, mapFrom((s) => s.canDelete)),
        forMember((d) => d.canView, mapFrom((s) => s.canView)),
        forMember((d) => d.permittedGarageIds, mapFrom((s) => s.permittedGarageIds || [])),
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
