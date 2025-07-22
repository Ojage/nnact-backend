import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceRequestDocument = ServiceRequest & Document;

export enum ServiceRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class ServiceRequest {
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  serviceType: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  })
  urgency: string;

  @Prop({ required: true })
  preferredDate: string;

  @Prop({ required: true })
  preferredTime: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: String,
    enum: ServiceRequestStatus,
    default: ServiceRequestStatus.PENDING,
  })
  status: ServiceRequestStatus;
}

export const ServiceRequestSchema =
  SchemaFactory.createForClass(ServiceRequest);
