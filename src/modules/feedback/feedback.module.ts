import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Client, ClientSchema } from '../clients/entities/client.entity';
import { Service, ServiceSchema } from '../services/entities/service.entity';
import { Feedback, FeedbackSchema } from './entities/feedback.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
