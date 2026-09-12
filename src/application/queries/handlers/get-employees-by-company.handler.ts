import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { GetEmployeesByCompanyQuery } from '../impl/get-employees-by-company.query';
import {
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
  Employee,
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
} from '@domain/index';
import { EmployeeResponseDto } from '../../dtos/employee.dto';

@QueryHandler(GetEmployeesByCompanyQuery)
export class GetEmployeesByCompanyHandler
  implements IQueryHandler<GetEmployeesByCompanyQuery, EmployeeResponseDto[]> {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async execute(query: GetEmployeesByCompanyQuery): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepo.findByCompanyId(query.companyId);
    const company = await this.companyRepo.findById(query.companyId);

    return employees.map((emp) => {
      const dto = this.mapper.map(emp, Employee, EmployeeResponseDto);
      dto.companyName = company?.companyName;
      return dto;
    });
  }
}
