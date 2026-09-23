import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { CreateEmployeeCommand } from '../impl/create-employee.command';
import {
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  Employee,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
} from '@domain/index';

import { parsePhoneNumbersInput } from '../../dtos/contact-phone.dto';
import { parseDocumentsInput } from '../../dtos/attached-document.dto';

@CommandHandler(CreateEmployeeCommand)
export class CreateEmployeeHandler implements ICommandHandler<CreateEmployeeCommand> {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(command: CreateEmployeeCommand): Promise<Employee> {
    const { companyId, dto } = command;

    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company with ID '${companyId}' was not found.`);
    }

    const existingEmail = await this.employeeRepo.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException(`Employee with email '${dto.email}' already exists.`);
    }

    const existingNid = await this.employeeRepo.findByNid(dto.nidNumber);
    if (existingNid) {
      throw new ConflictException(`Employee with NID '${dto.nidNumber}' already exists.`);
    }

    const phones = parsePhoneNumbersInput(dto.phoneNumbersJson || dto.phoneNumbers, dto.phoneNumber);
    const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
    const phoneToUse = primaryPhone ? primaryPhone.number : dto.phoneNumber;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const employee = Employee.create({
      id: uuidv4(),
      companyId: company.id,
      name: dto.name,
      address: dto.address,
      email: dto.email,
      password: hashedPassword,
      phoneNumber: phoneToUse,
      phoneNumbers: phones,
      documents: parseDocumentsInput(dto.documentsJson || dto.documents),
      role: 'GENERAL',
      nidNumber: dto.nidNumber,
      createdBy: `${company.id}|SUPER_ADMIN`,
    });

    await this.employeeRepo.save(employee);
    return employee;
  }
}
