import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Client } from 'src/modules/clients/entities/client.entity';
import { Service } from 'src/modules/services/entities/service.entity';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({
    required: true,
    type: Number,
    min: 1,
    max: 5,
  })
  rating: number; // 1 to 5

  @Prop({ required: false })
  comment: string;

  @Prop({ default: false })
  referral: boolean;

  @Prop({ default: Date.now })
  feedbackDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId | Client;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId | Service;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
