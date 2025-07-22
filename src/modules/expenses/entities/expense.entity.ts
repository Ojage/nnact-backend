import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  category: string; // e.g., "Fuel", "Data", "Food", "Transport"

  @Prop({
    required: true,
    type: Number,
    set: (value: number) => Math.round(value * 100) / 100, // Ensures 2 decimal places
  })
  amount: number;

  @Prop({ required: false })
  description: string;

  @Prop({ default: Date.now })
  expenseDate: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
