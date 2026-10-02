import { ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { LoginCommand } from '../impl/login.command';
import { ICompanyRepository, IEmployeeRepository, IGarageRepository } from "../../../domain/index";
import { AuthResponseDto } from '../../dtos/auth.dto';
export declare class LoginHandler implements ICommandHandler<LoginCommand> {
    private readonly companyRepo;
    private readonly employeeRepo;
    private readonly garageRepo;
    private readonly jwtService;
    constructor(companyRepo: ICompanyRepository, employeeRepo: IEmployeeRepository, garageRepo: IGarageRepository, jwtService: JwtService);
    execute(command: LoginCommand): Promise<AuthResponseDto>;
}
