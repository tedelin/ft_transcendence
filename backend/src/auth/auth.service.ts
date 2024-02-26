import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
    constructor(
        private databaseService: DatabaseService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}
    async signUp(authDto: AuthDto) {
        try {
            authDto.password = await argon.hash(authDto.password);
            const user = await this.databaseService.user.create({
                data: authDto,
            });
            return this.signToken(user.id, user.username);
        } catch (error) {
            console.log(error);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credential taken');
                }
            } else throw error;
        }
    }

    async login(loginUserDto: AuthDto) {
        const user = await this.databaseService.user.findUnique({
            where: {
                username: loginUserDto.username,
            },
        });
        if (!user) {
            throw new ForbiddenException('Invalid credentials');
        }
        const isPasswordValid = await argon.verify(
            user.password,
            loginUserDto.password,
        );
        if (!isPasswordValid) {
            throw new ForbiddenException('Invalid credentials');
        }

        return this.signToken(user.id, user.username);
    }

    async twoFaStatus(dto: AuthDto) {
        const user = await this.databaseService.user.findUnique({
            where: {
                username: dto.username,
            },
        });
        if (!user) {
            throw new ForbiddenException('Invalid credentials');
        }
        const isPasswordValid = await argon.verify(user.password, dto.password);
        if (!isPasswordValid) {
            throw new ForbiddenException('Invalid credentials');
        }

        const isTwoFa = user.useTwoFA;

        return { status: isTwoFa };
    }
    // This function will be used to authenticate the user with the 42 API

	async callback(code: string) {
		const formData = new FormData();
		formData.append('grant_type', 'authorization_code');
		formData.append('client_id', `${this.configService.get<string>('CLIENT_ID')}`);
		formData.append('client_secret', `${this.configService.get<string>('CLIENT_SECRET')}`);
		formData.append('code', `${code}`);
		formData.append('redirect_uri', `${this.configService.get<string>('REDIRECT_URI')}`);

		try {
			const response = await fetch('https://api.intra.42.fr/oauth/token', {
				method: 'POST',
				body: formData
			});
			const data = await response.json();
			const user = await this.getInfoFromToken(data.access_token);
			return this.validateUser(user);
		} catch (error) {
			console.log("faile here ");
			throw new UnauthorizedException('Invalid code');
		}
	}

	async validateUser(user: any) {
		const userExist = await this.databaseService.user.findUnique({
			where: {
				username: user.login
			}
		});
		if (userExist.useTwoFA) {
			return {requireTwoFa: true};
		} else if (userExist) {
			return this.signToken(userExist.id, userExist.username);
		}
		return {requireUsername: true};
	}

	// This function will be used to get the user's information from the token
	async getInfoFromToken(token: string) {
		try {
			const response = await fetch('https://api.intra.42.fr/v2/me', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Erreur HTTP: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			throw new UnauthorizedException('Invalid token');
		}
	}

    // This function will be used to sign a token for the client
    // The token will be used to authenticate the client and it will be used by the client
    async signToken(
        userId: number,
        username: string,
    ): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            username,
        };
        const secret = this.configService.get<string>('JWT_SECRET');
        const token = await this.jwtService.signAsync(payload, {
            secret: secret,
        });

        return { access_token: token }; // Return an object token to the client
    }

    async signTempTokenFor2FA(userName: string, password: string) {
        const payload = {
            userName,
			password
        };
        const secret = process.env.TEMP_SECRET2fA;
        const token = this.jwtService.signAsync(payload, {
			secret
		});
        return { access_token: token }; 
    }

    verifyAccessToken(accessToken: string) {
        try {
            const payload = this.jwtService.verify(accessToken, {
                secret: process.env.JWT_SECRET,
            });
            return payload;
        } catch (error) {
            return null;
        }
    }
}
