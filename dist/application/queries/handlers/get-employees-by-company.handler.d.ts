import { IQueryHandler } from '@nestjs/cqrs';
import { Mapper } from '@automapper/core';
import { GetEmployeesByCompanyQuery } from '../impl/get-employees-by-company.query';
import { IEmployeeRepository, ICompanyRepository } from "../../../domain/index";
import { EmployeeResponseDto } from '../../dtos/employee.dto';
export declare class GetEmployeesByCompanyHandler implements IQueryHandler<GetEmployeesByCompanyQuery, EmployeeResponseDto[]> {
    private readonly employeeRepo;
    private readonly companyRepo;
    private readonly mapper;
    constructor(employeeRepo: IEmployeeRepository, companyRepo: ICompanyRepository, mapper: Mapper);
    execute(query: GetEmployeesByCompanyQuery): Promise<EmployeeResponseDto[]>;
}
