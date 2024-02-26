import {
    Controller,
    Post,
    Body,
	Headers,
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
	
    @Post('validate-2fa-token')
    async validate2faToken(@Headers('Authorization') authHeader: string, @Body() dto: TokenTotpDto) {
        // Extrayez le token du header d'autorisation (supposant le format 'Bearer token')
        const token = authHeader.split(' ')[1];
        
        // Passez le token et le DTO au service pour validation
        return this.twoFAService.validate2faToken(token, dto.totp);
    }

	
    @Post('twoFaStatus')
    async twoFaStatus(@Body() dto: AuthDto) {
        return this.authService.twoFaStatus(dto);
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        const {token, isTwoFa} = await this.authService.callback(code);
		const { access_token } = token as { access_token: any };
		console.log(1);
		console.log("isTwoFa : ", isTwoFa);
		console.log("access_token : ", access_token);
		if(isTwoFa && access_token){
			const finalToken = await access_token;
			console.log(2);
			console.log("URL : ", `${process.env.HOST}:3000/two-factor-auth/validate?token=${finalToken}`);
            res.redirect(
                `${process.env.HOST}:3000/two-factor-auth/validate?token=${finalToken}`,
            );
            return;
		}
        else if(access_token){
			console.log(3);
			console.log("access_token : ", access_token);
			//console.log("access_token : ", access_token);
            res.redirect(
                `${process.env.HOST}:3000/chat?token=${access_token}`,
            );
            return;
        }
		else
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
