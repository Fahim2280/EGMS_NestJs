import { IQueryHandler } from '@nestjs/cqrs';
import { GetGuarantorsByCustomerQuery } from '../impl/get-guarantors-by-customer.query';
import { IGuarantorRepository } from "../../../domain/index";
import { GuarantorResponseDto } from '../../dtos/guarantor.dto';
export declare class GetGuarantorsByCustomerHandler implements IQueryHandler<GetGuarantorsByCustomerQuery> {
    private readonly guarantorRepo;
    constructor(guarantorRepo: IGuarantorRepository);
    execute(query: GetGuarantorsByCustomerQuery): Promise<GuarantorResponseDto[]>;
}
