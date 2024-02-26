import {
    Controller,
    Post,
    Body,
	Headers,
	Req,
    Get,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFAService } from './2FA/twoFA.service';
import { AuthDto, twoFaDto, totpDto, TokenTotpDto} from './dto';
import { Response } from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';
import { Request } from 'express';
import { OAuthGuard } from './guard/oauth.guard';

@Controller('auth')
export class AuthController {
	constructor(
	    private authService: AuthService,
		private twoFAService: TwoFAService,
	) {}

	@UseGuards(OAuthGuard)
	@Get('callback')
	async callback(@Req() req: Request) {
		console.log(req.user);
		// return this.authService.callback(code);
		return {requireTwoFa: true};
	}

    @Post('signin')
    async signIn(@Body() dto: AuthDto) {
        return this.authService.login(dto);
    }

    @Post('validate-2fa')
    async validate2fa(@Body() dto: totpDto) {
        return this.twoFAService.validate2fa(dto);
    }    
	
    @Post('validate-2fa-token')
    async validate2faToken(@Headers('Authorization') authHeader: string, @Body() dto: TokenTotpDto) {
        const token = authHeader.split(' ')[1];
        return this.twoFAService.validate2faToken(token, dto.totp);
    }

	
    @Post('twoFaStatus')
    async twoFaStatus(@Body() dto: AuthDto) {
        return this.twoFAService.twoFaStatus(dto);
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
