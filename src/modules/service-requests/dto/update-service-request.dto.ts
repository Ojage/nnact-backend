import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ServiceRequestStatus } from '../schemas/service-request.schema';

export class UpdateServiceRequestDto {
  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ServiceRequestStatus)
  @IsOptional()
  status?: ServiceRequestStatus;

  @IsString()
  @IsOptional()
  scheduledDate?: string;

  @IsString()
  @IsOptional()
  scheduledTime?: string;
}
