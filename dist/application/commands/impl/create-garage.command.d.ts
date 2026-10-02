import { CreateGarageDto } from '../../dtos/garage.dto';
export declare class CreateGarageCommand {
    readonly companyId: string;
    readonly dto: CreateGarageDto;
    constructor(companyId: string, dto: CreateGarageDto);
}
