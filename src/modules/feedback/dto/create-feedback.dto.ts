import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @IsOptional()
  referral?: boolean;

  @IsInt()
  clientId: number;

  @IsInt()
  serviceId: number;
}
