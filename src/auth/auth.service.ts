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
    const user = await this.usersService.findByPhone(phone);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject(); // Convert to plain object
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log('Login attempt for phone: ', loginDto.phone);
    const user = await this.validateUser(loginDto.phone, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // FIXED: Use user._id (MongoDB ObjectId) as the sub claim
    // Your JWT strategy expects payload.sub to be the user ID for findById()
    const payload = {
      sub: user._id.toString(), // Convert ObjectId to string
      phone: user.phone,
      iat: Math.floor(Date.now() / 1000), // Optional: include issued at time
    };

    console.log('JWT payload:', payload);

    const token = this.jwtService.sign(payload);
    console.log('Generated token:', token);

    return {
      access_token: token,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByPhone(registerDto.phone);
    if (existingUser) {
      throw new UnauthorizedException(
        'User with this phone number already exists',
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const user = await this.usersService.create({
      name: registerDto.name,
      phone: registerDto.phone,
      password: hashedPassword,
    });

    const { password, ...result } = user.toObject();
    return {
      id: result._id.toString(),
      name: result.name,
      phone: result.phone,
      email: result.email,
    };
  }
}
