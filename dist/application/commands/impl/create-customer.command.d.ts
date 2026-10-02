import { CreateCustomerDto } from '../../dtos/customer.dto';
export declare class CreateCustomerCommand {
    readonly companyId: string;
    readonly dto: CreateCustomerDto;
    readonly actorStamp?: string | undefined;
    constructor(companyId: string, dto: CreateCustomerDto, actorStamp?: string | undefined);
}
