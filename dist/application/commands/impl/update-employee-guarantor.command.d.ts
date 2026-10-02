import { UpdateGuarantorDto } from '../../dtos/guarantor.dto';
export declare class UpdateEmployeeGuarantorCommand {
    readonly companyId: string;
    readonly employeeId: string;
    readonly guarantorId: string;
    readonly dto: UpdateGuarantorDto;
    readonly actorStamp?: string | undefined;
    constructor(companyId: string, employeeId: string, guarantorId: string, dto: UpdateGuarantorDto, actorStamp?: string | undefined);
}
