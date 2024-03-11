import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { twoFaDto, totpDto } from '../dto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import {AuthService} from '../auth.service'
import * as argon from 'argon2';
import { AuthDto } from '../dto';

@Injectable()
export class TwoFAService {
    constructor(private databaseService: DatabaseService, 
		private jwtService : JwtService,
		private authService : AuthService
	) {}
    async register2fa(userObj: any) {
        const temp_secret = authenticator.generateSecret();
        const userId = userObj.id;

        const otpauthUrl = authenticator.keyuri(
            userId.toString(),
            'ft_transcendence',
            temp_secret,
        );
        try {
            await this.databaseService.user.update({
                where: { id: userId },
                data: { secretTwoFA: temp_secret },
            });

            const qrCodeImage = await QRCode.toDataURL(otpauthUrl);

            return { qrcode: qrCodeImage, secret: temp_secret };
        } catch (error) {
            throw new Error('Could not generate QR code');
        }
    }

    async verify2fa(userObj: any, dto: twoFaDto) {
        const userId = userObj.id;
        const user = await this.databaseService.user.findUnique({
            where: { id: userId },
        });

        const isVerified = authenticator.verify({
            token: dto.token,
            secret: user.secretTwoFA,
        });

        if (!isVerified) {
            return {
                verified: false,
            };
        }

        await this.databaseService.user.update({
            where: { id: userId },
            data: {
                useTwoFA: true,
            },
        });

        return { verified: true };
    }

    async validate2fa(user: any, code: string) {
        const userdb = await this.databaseService.user.findUnique({
            where: { id42: user.id },
        });
		if (!userdb) throw new ForbiddenException('User doesn\'t exist');
        const isVerified = authenticator.verify({
            token: code,
            secret: userdb.secretTwoFA,
        });
        if (!isVerified) throw new ForbiddenException('Invalid 2FA code');
        return this.authService.signToken(userdb.id, userdb.username);
    }

	async validate2faToken(token: string, totpCode: string) {
		const userInfo = this.jwtService.decode(token);
		const user = await this.databaseService.user.findUnique({
			where: { username: userInfo.userName }, 
		});
		const isVerified = authenticator.verify({
			token: totpCode,
			secret: user.secretTwoFA,
		});
	
		if (!isVerified) return { validated: false };
		const finaltoken = await this.authService.signToken(user.id, user.username);
		return {
			finaltoken, 
			validated: true };
	}

	async twoFaStatus(dto: AuthDto) {
        const user = await this.databaseService.user.findUnique({
            where: {
                username: dto.username,
            },
        });
        if (!user) throw new ForbiddenException('Invalid credentials');
        const isPasswordValid = await argon.verify(user.password, dto.password);
        if (!isPasswordValid) throw new ForbiddenException('Invalid credentials');
        return { status: user.useTwoFA };
    }
	

    async turnoff2FA(userObj: any) {
        const userId = userObj.id;

        try {
            await this.databaseService.user.update({
                where: { id: userId },
                data: {
                    secretTwoFA: null,
                    useTwoFA: false,
                },
            });
        } catch (error) {
            throw new Error('Could not turn off 2FA');
        }
    }
}
