import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto/login.dto';
import { RegisterDto } from './dto/register.dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone); // Changed from findByEmail to findByPhone
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.phone, loginDto.password); // Changed from email to phone
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { phone: user.phone, sub: user.id }; // Changed from email to phone
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(registerDto: RegisterDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const user = await this.usersService.create({
      name: registerDto.name,
      phone: registerDto.phone,
      password: hashedPassword,
      // include any other required fields here
    });

    const { password, ...result } = user.toObject(); // Use toObject() to get plain object
    return result;
  }
}
