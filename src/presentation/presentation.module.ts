import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { GarageController } from './controllers/garage.controller';
import { EmployeeController } from './controllers/employee.controller';
import { CustomerController } from './controllers/customer.controller';
import { ElectricBillController } from './controllers/electric-bill.controller';
import { AuditLogController } from './controllers/audit-log.controller';
import { ErrorController } from './controllers/error.controller';
import { FileController } from './controllers/file.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    DashboardController,
    GarageController,
    EmployeeController,
    CustomerController,
    ElectricBillController,
    AuditLogController,
    ErrorController,
    FileController,
  ],
})
export class PresentationModule {}
