import { CreateEmployeeDto } from '../../dtos/employee.dto';
export declare class CreateEmployeeCommand {
    readonly companyId: string;
    readonly dto: CreateEmployeeDto;
    constructor(companyId: string, dto: CreateEmployeeDto);
}
