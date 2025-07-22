import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsInt,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsNumber()
  @IsOptional()
  amountSpent?: number;

  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsInt()
  @IsOptional()
  leadTechnicianId?: number;
}
