import { IQueryHandler } from '@nestjs/cqrs';
import { GetEmployeeByIdQuery } from '../impl/get-employee-by-id.query';
import { IEmployeeRepository, Employee } from "../../../domain/index";
export declare class GetEmployeeByIdHandler implements IQueryHandler<GetEmployeeByIdQuery> {
    private readonly employeeRepo;
    constructor(employeeRepo: IEmployeeRepository);
    execute(query: GetEmployeeByIdQuery): Promise<Employee>;
}
