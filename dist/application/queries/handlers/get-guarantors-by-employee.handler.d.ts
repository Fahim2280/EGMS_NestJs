import { IQueryHandler } from '@nestjs/cqrs';
import { GetGuarantorsByEmployeeQuery } from '../impl/get-guarantors-by-employee.query';
import { IGuarantorRepository } from "../../../domain/index";
import { GuarantorResponseDto } from '../../dtos/guarantor.dto';
export declare class GetGuarantorsByEmployeeHandler implements IQueryHandler<GetGuarantorsByEmployeeQuery> {
    private readonly guarantorRepo;
    constructor(guarantorRepo: IGuarantorRepository);
    execute(query: GetGuarantorsByEmployeeQuery): Promise<GuarantorResponseDto[]>;
}
