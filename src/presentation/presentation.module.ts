import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { GarageController } from './controllers/garage.controller';
import { EmployeeController } from './controllers/employee.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    DashboardController,
    GarageController,
    EmployeeController,
  ],
})
export class PresentationModule {}
