import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { UserPayload } from './auth/jwt.strategy';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@CurrentUser() user: UserPayload, @Req() req: any) {
    console.log('=== /me endpoint hit ===');
    console.log('Request headers:', req.headers);
    console.log('User from decorator:', user);
    console.log('User from request:', req.user);

    return {
      message: 'Current user retrieved successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    };
  }
}
