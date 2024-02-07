import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { twoFaDto } from '../dto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFAService {
    constructor(private databaseService: DatabaseService) {}
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

            return qrCodeImage;
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

    async validate2fa(userObj: any, dto: twoFaDto) {
        const userId = userObj.id;
        const user = await this.databaseService.user.findUnique({
            where: { id: userId },
        });

        if (!user.useTwoFA) {
            throw new Error('2FA not enabled for this user');
        }

        const isValid = authenticator.verify({
            token: dto.token,
            secret: user.secretTwoFA,
        });

        if (!isValid) return { validated: false };
        return { validated: true };
    }
}
