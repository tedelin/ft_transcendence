import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Response } from 'express';

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

  @Get('callback')
  async callback(@Query('code') code: string) {
    return await this.authService.callback(code);
  }
}
