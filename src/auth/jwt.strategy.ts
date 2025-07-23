import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

type PayloadType = {
  sub: string; // userId
  iat: number;
  exp: number;
};

export type UserPayload = {
  id: string;
  name: string;
  email?: string;
  phone: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET') || 'your-secret-key', // Fallback for debugging
    });
    console.log('JWT Strategy initialized');
    console.log('JWT_SECRET:', config.get<string>('JWT_SECRET'));
  }

  async validate(payload: PayloadType): Promise<UserPayload> {
    console.log('JWT Strategy validate called with payload:', payload);

    try {
      const user = await this.userService.findById(payload.sub);
      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) {
        console.log('User not found, throwing UnauthorizedException');
        throw new UnauthorizedException('Invalid user');
      }

      const userPayload = {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        name: user.name,
      };

      console.log('Returning user payload:', userPayload);
      return userPayload;
    } catch (error) {
      console.log('Error in JWT validate:', error);
      throw error;
    }
  }
}
