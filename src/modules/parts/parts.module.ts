import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { Service, ServiceSchema } from '../services/entities/service.entity';
import { Part, PartSchema } from './entities/part.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Part.name, schema: PartSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [PartsController],
  providers: [PartsService],
})
export class PartsModule {}
