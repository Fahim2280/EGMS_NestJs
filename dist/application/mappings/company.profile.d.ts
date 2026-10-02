import { AutomapperProfile } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
export declare class CompanyProfile extends AutomapperProfile {
    constructor(mapper: Mapper);
    get profile(): (mapper: Mapper) => void;
}
