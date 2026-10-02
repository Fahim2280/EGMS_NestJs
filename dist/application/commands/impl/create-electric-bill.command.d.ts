import { CreateElectricBillDto } from '../../dtos/electric-bill.dto';
export declare class CreateElectricBillCommand {
    readonly companyId: string;
    readonly dto: CreateElectricBillDto;
    readonly actorStamp?: string | undefined;
    constructor(companyId: string, dto: CreateElectricBillDto, actorStamp?: string | undefined);
}
