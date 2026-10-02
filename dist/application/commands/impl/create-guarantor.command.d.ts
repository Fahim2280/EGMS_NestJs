import { CreateGuarantorDto } from '../../dtos/guarantor.dto';
export declare class CreateGuarantorCommand {
    readonly companyId: string;
    readonly customerId: string;
    readonly dto: CreateGuarantorDto;
    readonly actorStamp?: string | undefined;
    constructor(companyId: string, customerId: string, dto: CreateGuarantorDto, actorStamp?: string | undefined);
}
