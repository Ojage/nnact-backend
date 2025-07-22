import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Client } from 'src/modules/clients/entities/client.entity';
import { Service } from 'src/modules/services/entities/service.entity';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  paymentMethod: string; // e.g. "Cash", "MTN MoMo", "Orange Money", "Bank Transfer"

  @Prop({
    required: true,
    type: Number,
    set: (value: number) => Math.round(value * 100) / 100, // Ensures 2 decimal places
  })
  amount: number;

  @Prop({ required: false })
  notes: string;

  @Prop({ default: Date.now })
  paidAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId | Client;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service: Types.ObjectId | Service;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
