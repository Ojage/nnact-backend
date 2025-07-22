import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Abang Stephen',
    description: 'User full name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: '620006799',
    description: 'User phone number',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  phone: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
