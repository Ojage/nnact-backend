import { IsString, IsNumber, IsInt, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  paymentMethod: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  clientId: number;

  @IsInt()
  serviceId: number;
}
