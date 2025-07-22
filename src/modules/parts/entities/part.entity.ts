import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PartDocument = Part & Document;

@Schema({ timestamps: { createdAt: 'purchaseDate', updatedAt: false } })
export class Part {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  unitCost: number;

  @Prop({ type: Number, required: true })
  totalCost: number;

  @Prop({ type: String })
  supplierInfo?: string;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  usedForService?: Types.ObjectId;
}

export const PartSchema = SchemaFactory.createForClass(Part);
