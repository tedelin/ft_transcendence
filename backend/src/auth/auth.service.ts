import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { DatabaseService } from '../database/database.service';
import { Prisma, UserStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/auth.dto';
import { Express } from 'express';

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
                data: {
					username: authDto.username,
					password: authDto.password,
					status: UserStatus.ONLINE,
				}
            });
            return this.signToken(user.id, user.username);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credential taken');
                }
            } else
			{
				throw error;
			} 
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


	async signup42(user: any, signUpDto: SignUpDto, file: Express.Multer.File | undefined) {
		const userExist = await this.databaseService.user.findUnique({
			where: {
				id42: user.id
			}
		});
		if (userExist) throw new ForbiddenException('User already exist');
	
		const usernameExist = await this.databaseService.user.findUnique({
			where: {
				username: signUpDto.username
			}
		});
		if (usernameExist) throw new ForbiddenException('Username already taken');
		let avatarPath = 'default-avatar.jpg'; 
		if (file && file.filename) {
			avatarPath = file.filename;
		}
		const newUser = await this.databaseService.user.create({
			data: {
				username: signUpDto.username,
				password: '',
				status: UserStatus.ONLINE,
				id42: user.id,
				avatar: avatarPath,
			}
		});
	
		return this.signToken(newUser.id, newUser.username);
	}
	

	async getAccessTokenFromCode(code: string) {
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
			return await response.json();
		} catch (error) {
			throw new UnauthorizedException('Invalid code');
		}
	}

	async callback(code: string) {
		const data = await this.getAccessTokenFromCode(code);
		const user = await this.getInfoFromToken(data.access_token);
		return this.validateUser(user, data.access_token);
	}

	async validateUser(user: any, token: string) {
		const userExist = await this.databaseService.user.findUnique({
			where: {
				id42: user.id
			}
		});
		if (!userExist) {
			return {requireUsername: true, token42: token};
		} 
		else if (userExist.useTwoFA) {
			return {requireTwoFa: true, token42: token};
		} else if (userExist) {
			return this.signToken(userExist.id, userExist.username);
		}
		return this.signToken(userExist.id, userExist.username);
	}

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
			expiresIn: '7d'
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
