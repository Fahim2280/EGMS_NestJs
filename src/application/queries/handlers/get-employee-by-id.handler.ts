import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetEmployeeByIdQuery } from '../impl/get-employee-by-id.query';
import { EMPLOYEE_REPOSITORY_TOKEN, IEmployeeRepository, Employee } from '@domain/index';

@QueryHandler(GetEmployeeByIdQuery)
export class GetEmployeeByIdHandler implements IQueryHandler<GetEmployeeByIdQuery> {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {}

  async execute(query: GetEmployeeByIdQuery): Promise<Employee> {
    const { id, companyId } = query;
    const employee = await this.employeeRepo.findById(id);
    if (!employee || employee.companyId !== companyId || employee.isDeleted) {
      throw new NotFoundException(`Employee not found.`);
    }
    return employee;
  }
}
