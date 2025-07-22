import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  serviceType: string;

  @IsNotEmpty()
  @IsString()
  description: string; // Changed from problemDescription to match payload

  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string; // ISO date format (YYYY-MM-DD)

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM format',
  })
  scheduledTime: string;

  @IsNotEmpty()
  @IsEnum(['Low', 'Medium', 'High'])
  priority: 'Low' | 'Medium' | 'High';

  @IsNotEmpty()
  @IsEnum(['Scheduled', 'In Progress', 'Completed', 'Cancelled'])
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  estimatedCost: number; // Changed from @IsDecimal to @IsNumber since payload sends integer

  @IsOptional()
  @IsString()
  notes?: string; // Changed from additionalNotes to match payload

  @IsNotEmpty()
  @IsString()
  clientId: string; // Changed from string to number to match payload

  @IsOptional()
  @IsString()
  technicianId?: string; // Changed from string to number to match payload
}
