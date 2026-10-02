import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IEmployeeRepository } from "../../domain/index";
export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
    companyName?: string;
    phoneNumber?: string;
    nidNumber?: string;
    garageName?: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly employeeRepo;
    constructor(configService: ConfigService, employeeRepo: IEmployeeRepository);
    validate(payload: any): Promise<{
        id: any;
        email: any;
        name: any;
        role: string;
        companyId: any;
        companyName: any;
        phoneNumber: any;
        nidNumber: any;
        garageName: any;
        isSuperAdmin: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canView: boolean;
        garageIds: null;
    } | {
        id: string;
        email: string;
        name: string;
        role: string;
        companyId: string;
        companyName: any;
        phoneNumber: string;
        nidNumber: string;
        isSuperAdmin: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canView: boolean;
        garageIds: string[] | null;
        garageName?: undefined;
    }>;
}
export {};
