import { UpdateGarageDto } from '../../dtos/garage.dto';
export declare class UpdateGarageCommand {
    readonly id: string;
    readonly companyId: string;
    readonly dto: UpdateGarageDto;
    readonly actorStamp?: string | undefined;
    constructor(id: string, companyId: string, dto: UpdateGarageDto, actorStamp?: string | undefined);
}
