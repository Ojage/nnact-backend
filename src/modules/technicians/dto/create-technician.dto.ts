import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsArray,
  //   IsPostalCode,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnicianDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'abang.junior@nnact.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+237620000000' })
  @IsPhoneNumber(null)
  phone: string;

  @ApiProperty({ example: '123 Tech Street', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Buea', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Southwest', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  //   @ApiProperty({ example: '237001', required: false })
  //   @IsPostalCode('any')
  //   @IsOptional()
  //   zipCode?: string;

  @ApiProperty({
    example: ['Printer Repair', 'Networking'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  specialties?: string[];

  @ApiProperty({ example: 'Limbe', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '50000', required: false })
  @IsString()
  @IsOptional()
  monthlyRate?: string;

  @ApiProperty({ example: '5 years', required: false })
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiProperty({ example: 'Field Technician' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'CompTIA A+, CCNA', required: false })
  @IsString()
  @IsOptional()
  certifications?: string;

  @ApiProperty({ example: 'Available', default: 'Available', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 'Very punctual and skilled in PC maintenance.',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
