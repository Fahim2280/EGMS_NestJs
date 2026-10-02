import { UpdateElectricBillDto } from '../../dtos/electric-bill.dto';
export declare class UpdateElectricBillCommand {
    readonly id: string;
    readonly companyId: string;
    readonly dto: UpdateElectricBillDto;
    readonly actorStamp?: string | undefined;
    constructor(id: string, companyId: string, dto: UpdateElectricBillDto, actorStamp?: string | undefined);
}
