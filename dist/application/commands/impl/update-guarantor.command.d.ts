import { UpdateGuarantorDto } from '../../dtos/guarantor.dto';
export declare class UpdateGuarantorCommand {
    readonly companyId: string;
    readonly customerId: string;
    readonly guarantorId: string;
    readonly dto: UpdateGuarantorDto;
    readonly actorStamp?: string | undefined;
    constructor(companyId: string, customerId: string, guarantorId: string, dto: UpdateGuarantorDto, actorStamp?: string | undefined);
}
