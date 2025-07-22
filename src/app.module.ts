import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ClientsModule } from './modules/clients/clients.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { ServicesModule } from './modules/services/services.module';
import { PartsModule } from './modules/parts/parts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ClientsModule,
    TechniciansModule,
    ServicesModule,
    PartsModule,
    PaymentsModule,
    ExpensesModule,
    FeedbackModule,
    ProjectsModule,
    AuthModule,
    UsersModule,
    ServiceRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
