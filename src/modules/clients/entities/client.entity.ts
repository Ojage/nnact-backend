import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: String })
  address: string;

  @Prop()
  city?: string;

  @Prop()
  region?: string;

  @Prop()
  notes?: string;

  @Prop({ enum: ['Active', 'Inactive'], default: 'Active' })
  status: 'Active' | 'Inactive';

  @Prop({ default: false })
  isInWhatsappGroup: boolean;

  @Prop({ default: false })
  isRepeatCustomer: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
