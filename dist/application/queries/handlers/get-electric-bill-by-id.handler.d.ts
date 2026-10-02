import { IQueryHandler } from '@nestjs/cqrs';
import { GetElectricBillByIdQuery } from '../impl/get-electric-bill-by-id.query';
import { ICustomerRepository, IElectricBillRepository } from "../../../domain/index";
import { ElectricBillResponseDto } from '../../dtos/electric-bill.dto';
export declare class GetElectricBillByIdHandler implements IQueryHandler<GetElectricBillByIdQuery> {
    private readonly billRepo;
    private readonly customerRepo;
    constructor(billRepo: IElectricBillRepository, customerRepo: ICustomerRepository);
    execute(query: GetElectricBillByIdQuery): Promise<ElectricBillResponseDto>;
}
