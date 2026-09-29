import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGuarantorsByEmployeeQuery } from '../impl/get-guarantors-by-employee.query';
import {
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';
import { GuarantorResponseDto } from '../../dtos/guarantor.dto';

@QueryHandler(GetGuarantorsByEmployeeQuery)
export class GetGuarantorsByEmployeeHandler
  implements IQueryHandler<GetGuarantorsByEmployeeQuery>
{
  constructor(
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
  ) {}

  async execute(query: GetGuarantorsByEmployeeQuery): Promise<GuarantorResponseDto[]> {
    const list = await this.guarantorRepo.findByEmployeeId(query.employeeId);
    return list
      .filter((g) => g.companyId === query.companyId)
      .map((g) => ({
        id: g.id,
        employeeId: g.employeeId,
        companyId: g.companyId,
        name: g.name,
        fatherName: g.fatherName,
        motherName: g.motherName,
        address: g.address,
        mobileNumber: g.mobileNumber,
        phoneNumbers: g.phoneNumbers,
        documents: g.documents || [],
        nidNumber: g.nidNumber,
        relationship: g.relationship,
        createdDate: g.createdDate,
      }));
  }
}
