import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TechnicianDocument = Technician & Document;

@Schema({ timestamps: { createdAt: 'dateJoined', updatedAt: false } })
export class Technician {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  region?: string;

  @Prop({ type: [String], default: [] })
  specialties: string[];

  @Prop()
  location?: string;

  @Prop()
  monthlyRate?: string;

  @Prop()
  experience?: string;

  @Prop({ required: true })
  role: string; // "Lead", "Field", "Support"

  @Prop()
  certifications?: string;

  @Prop({ default: 'Available' })
  status: string;

  @Prop()
  notes?: string;
}

export const TechnicianSchema = SchemaFactory.createForClass(Technician);
