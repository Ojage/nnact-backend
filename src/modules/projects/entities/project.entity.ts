import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
  })
  status: string;

  @Prop({ type: Date, required: false })
  startDate?: Date;

  @Prop({ type: Date, required: false })
  endDate?: Date;

  @Prop({ type: Number, default: 0 })
  budget: number;

  @Prop({ type: Number, default: 0 })
  amountSpent: number;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: false })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Technician', required: false })
  leadTechnician: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }], required: false })
  services: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
