import { UpdateCustomerDto } from '../../dtos/customer.dto';
export declare class UpdateCustomerCommand {
    readonly id: string;
    readonly companyId: string;
    readonly dto: UpdateCustomerDto;
    readonly actorStamp?: string | undefined;
    constructor(id: string, companyId: string, dto: UpdateCustomerDto, actorStamp?: string | undefined);
}
