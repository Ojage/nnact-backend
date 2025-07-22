import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEmail,
  IsIn,
} from 'class-validator';

export class CreateServiceRequestDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsIn(['low', 'medium', 'high'])
  urgency: string;

  @IsDateString()
  preferredDate: string;

  @IsString()
  preferredTime: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
