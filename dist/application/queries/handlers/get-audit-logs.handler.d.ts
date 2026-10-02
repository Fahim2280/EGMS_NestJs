import { IQueryHandler } from '@nestjs/cqrs';
import { GetAuditLogsQuery } from '../impl/get-audit-logs.query';
import { IAuditLogRepository, IEmployeeRepository, ICustomerRepository } from "../../../domain/index";
import { GetAuditLogsResponseDto } from '../../dtos/audit-log.dto';
export declare class GetAuditLogsHandler implements IQueryHandler<GetAuditLogsQuery, GetAuditLogsResponseDto> {
    private readonly auditRepo;
    private readonly employeeRepo;
    private readonly customerRepo;
    constructor(auditRepo: IAuditLogRepository, employeeRepo: IEmployeeRepository, customerRepo: ICustomerRepository);
    execute(query: GetAuditLogsQuery): Promise<GetAuditLogsResponseDto>;
}
