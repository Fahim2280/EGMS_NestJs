import { IQueryHandler } from '@nestjs/cqrs';
import { GetElectricBillsByCompanyQuery } from '../impl/get-electric-bills-by-company.query';
import { ICustomerRepository, IElectricBillRepository } from "../../../domain/index";
import { ElectricBillResponseDto } from '../../dtos/electric-bill.dto';
export declare class GetElectricBillsByCompanyHandler implements IQueryHandler<GetElectricBillsByCompanyQuery> {
    private readonly billRepo;
    private readonly customerRepo;
    constructor(billRepo: IElectricBillRepository, customerRepo: ICustomerRepository);
    execute(query: GetElectricBillsByCompanyQuery): Promise<ElectricBillResponseDto[]>;
}
