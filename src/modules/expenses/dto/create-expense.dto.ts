import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
