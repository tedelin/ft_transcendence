import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { twoFaDto, totpDto } from '../dto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import {AuthService} from '../auth.service'

@Injectable()
export class TwoFAService {
    constructor(private databaseService: DatabaseService, 
		private JwtService : JwtService,
		private AuthService : AuthService
	) {}
    async register2fa(userObj: any) {
        const temp_secret = authenticator.generateSecret();
        const userId = userObj.id;

        const otpauthUrl = authenticator.keyuri(
            userId.toString(),
            'YourApp',
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
            console.error('Error generating QR code', error);
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

        // Marque le 2FA comme activé et conserve le secret comme permanent
        await this.databaseService.user.update({
            where: { id: userId },
            data: {
                useTwoFA: true,
            },
        });

        return { verified: true };
    }

    async validate2fa(dto: totpDto) {
        const userName = dto.username;
        const user = await this.databaseService.user.findUnique({
            where: { username: userName },
        });

        const isVerified = authenticator.verify({
            token: dto.totp,
            secret: user.secretTwoFA,
        });

        if (!isVerified) return { validated: false };
        return { validated: true };
    }

	async validate2faToken(token: string, totpCode: string) {
		// Décoder le token pour obtenir les infos de l'utilisateur
		const userInfo = this.JwtService.decode(token);
		console.log("userInfo : ", userInfo);
		// Récupérer l'utilisateur depuis la base de données
		const user = await this.databaseService.user.findUnique({
			where: { username: userInfo.userName }, // ou username: userInfo.username, selon le contenu de ton token
		});
		// Vérifier le code TOTP
		const isVerified = authenticator.verify({
			token: totpCode,
			secret: user.secretTwoFA,
		});
	
		if (!isVerified) return { validated: false };
		const finaltoken = await this.AuthService.signToken(user.id, user.username);
		console.log("finaltoken : ", finaltoken);
		return {
			finaltoken, 
			validated: true };
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
            console.error('Error turning off 2FA :', error);
            throw new Error('Could not turn off 2FA');
        }
    }
}
