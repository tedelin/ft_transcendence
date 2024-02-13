import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFAService } from './2FA/twoFA.service';
import { AuthDto, twoFaDto, totpDto } from './dto';
import { Response } from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private twoFAService: TwoFAService,
    ) {}

    @Post('signup')
    async signUp(@Body() dto: AuthDto) {
        return this.authService.signUp(dto);
    }

    @Post('signin')
    async signIn(@Body() dto: AuthDto) {
        return this.authService.login(dto);
    }

    @Post('validate-2fa')
    async validate2fa(@Body() dto: totpDto) {
        return this.twoFAService.validate2fa(dto);
    }

    @Post('twoFaStatus')
    async twoFaStatus(@Body() dto: AuthDto) {
        return this.authService.twoFaStatus(dto);
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        const tokenData = await this.authService.callback(code);
        if (tokenData) {
            res.redirect(
                `${process.env.HOST}:3000/chat?token=${tokenData.access_token}`,
            );
            return;
        }
        console.log('no token');
    }
    @UseGuards(JwtGuard)
    @Get('register-2fa')
    async register2fa(@User() id: any) {
        return this.twoFAService.register2fa(id);
    }

    @UseGuards(JwtGuard)
    @Post('verify-2fa')
    async verify2fa(@User() id: any, @Body() dto: twoFaDto) {
        return this.twoFAService.verify2fa(id, dto);
    }
    @UseGuards(JwtGuard)
    @Get('turnOff-2fa')
    turnoff2FA(@User() id: any) {
        return this.twoFAService.turnoff2FA(id);
    }
}
