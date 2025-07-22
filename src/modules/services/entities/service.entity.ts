import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, unique: true })
  serviceNumber: string;

  @Prop({ required: true })
  serviceType: string; // e.g., "AC Installation"

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  scheduledDate: string; // ISO date string

  @Prop({ required: true })
  scheduledTime: string;

  @Prop({ enum: ['Low', 'Medium', 'High'], default: 'Medium' })
  priority: 'Low' | 'Medium' | 'High';

  @Prop({
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  })
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

  @Prop({ type: Number, required: true })
  estimatedCost: number;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Technician', required: false })
  assignedTechnician?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
  project?: Types.ObjectId;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
