import { ICommandHandler } from '@nestjs/cqrs';
import { RejectCompanyCommand } from '../impl/reject-company.command';
import { ICompanyApprovalTokenRepository, ICompanyRepository } from "../../../domain/index";
export declare class RejectCompanyHandler implements ICommandHandler<RejectCompanyCommand> {
    private readonly approvalTokenRepo;
    private readonly companyRepo;
    constructor(approvalTokenRepo: ICompanyApprovalTokenRepository, companyRepo: ICompanyRepository);
    execute(command: RejectCompanyCommand): Promise<void>;
}
