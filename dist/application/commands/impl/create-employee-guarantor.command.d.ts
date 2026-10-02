import { CreateGuarantorDto } from '../../dtos/guarantor.dto';
export declare class CreateEmployeeGuarantorCommand {
    readonly companyId: string;
    readonly employeeId: string;
    readonly dto: CreateGuarantorDto;
    readonly actorStamp?: string | undefined;
    constructor(companyId: string, employeeId: string, dto: CreateGuarantorDto, actorStamp?: string | undefined);
}
