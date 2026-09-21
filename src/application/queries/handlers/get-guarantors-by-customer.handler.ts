import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGuarantorsByCustomerQuery } from '../impl/get-guarantors-by-customer.query';
import {
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';
import { GuarantorResponseDto } from '../../dtos/guarantor.dto';

@QueryHandler(GetGuarantorsByCustomerQuery)
export class GetGuarantorsByCustomerHandler
  implements IQueryHandler<GetGuarantorsByCustomerQuery>
{
  constructor(
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
  ) {}

  async execute(query: GetGuarantorsByCustomerQuery): Promise<GuarantorResponseDto[]> {
    const list = await this.guarantorRepo.findByCustomerId(query.customerId);
    return list
      .filter((g) => g.companyId === query.companyId)
      .map((g) => ({
        id: g.id,
        customerId: g.customerId,
        companyId: g.companyId,
        name: g.name,
        fatherName: g.fatherName,
        motherName: g.motherName,
        address: g.address,
        mobileNumber: g.mobileNumber,
        nidNumber: g.nidNumber,
        relationship: g.relationship,
        createdDate: g.createdDate,
      }));
  }
}
