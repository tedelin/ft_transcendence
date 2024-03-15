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
	BadRequestException,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { TwoFAService } from './2FA/twoFA.service';
import { AuthDto, twoFaDto, totpDto, TokenTotpDto} from './dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';
import { Request, Response } from 'express';
import { OAuthGuard } from './guard/oauth.guard';
import { SignUpDto, twoFaCodeDto } from './dto/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';



@Controller('auth')
export class AuthController {
	constructor(
	    private authService: AuthService,
		private twoFAService: TwoFAService,
	) {}

	@Get('callback')
	async callback(@Query('code') code: string) {
		if (!code) throw new BadRequestException('No code provided');
		return this.authService.callback(code);
	}

    @Post('signin')
    async signIn(@Body() dto: AuthDto) {
        return this.authService.login(dto);
    }

	@Post('signup')
	async signUpLocal(@Body() dto: AuthDto) {
		return this.authService.signUp(dto);
	}

    @UseGuards(OAuthGuard)
    @Post('42signup')
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
              const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(file.originalname)}`;
              cb(null, uniqueName);
            }
          }),
          limits: { fileSize: 2 * 1024 * 1024 },
          fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
              return cb(new BadRequestException('Only pictures are allowed jpg jpeg png gif'), false);
            }
            cb(null, true);
          },
      }))
    async signUp(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Body() dto: SignUpDto) {
        // dans file y a le fichier et dans dto y a le username
        return this.authService.signup42(req.user, dto, file);
    }
	
	@UseGuards(OAuthGuard)
    @Post('validate-2fa')
    async validate2fa(@Req() req: Request, @Body() dto: twoFaCodeDto) {
        return this.twoFAService.validate2fa(req.user, dto.code);
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
