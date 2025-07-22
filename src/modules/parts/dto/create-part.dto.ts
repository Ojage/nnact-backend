import { IsString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreatePartDto {
  @IsString()
  name: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  unitCost: number;

  @IsNumber()
  totalCost: number;

  @IsString()
  @IsOptional()
  supplierInfo?: string;

  @IsInt()
  @IsOptional()
  usedForServiceId?: number;
}
