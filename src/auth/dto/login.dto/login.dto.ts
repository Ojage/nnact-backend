import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: '620006799',
    description: 'User phone number',
    minLength: 8,
    required: true,
  })
  @IsString()
  @MinLength(8)
  phone: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
