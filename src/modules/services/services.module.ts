import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Client, ClientSchema } from '../clients/entities/client.entity';
import {
  Technician,
  TechnicianSchema,
} from '../technicians/entities/technician.entity';
import { Service, ServiceSchema } from './entities/service.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Technician.name, schema: TechnicianSchema },
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
