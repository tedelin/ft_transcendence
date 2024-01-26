import { Controller, Post, Body, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto : AuthDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  async signIn(@Body() dto : AuthDto) {
    return this.authService.login(dto);
  }
}
