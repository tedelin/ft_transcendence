import { ForbiddenException, Injectable } from '@nestjs/common';
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

    // This function will be used to authenticate the user with the 42 API

    async callback(code: string) {
        const url = 'https://api.intra.42.fr/oauth/token';

        const formData = new FormData();
        // const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI);
        formData.append('grant_type', 'authorization_code');
        formData.append(
            'client_id',
            `${this.configService.get<string>('CLIENT_ID')}`,
        );
        formData.append(
            'client_secret',
            `${this.configService.get<string>('CLIENT_SECRET')}`,
        );
        formData.append('code', `${code}`);
        formData.append(
            'redirect_uri',
            `${this.configService.get<string>('REDIRECT_URI')}`,
        );

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            const infos = await this.getInfoFromToken(data.access_token);

            if (!infos || !infos.login) {
                throw new Error('Informations utilisateur manquantes');
            }

            const username = infos['login'];
            let user = await this.databaseService.user.findUnique({
                where: {
                    username,
                },
            });

            if (user) {
                // The user already exists, log him in
                const authDto = new AuthDto();
                authDto.username = username;
                authDto.password = `42st4d3nt${infos.id}`; // Recovers password according to pattern
                return await this.login(authDto);
            } else {
                // The user doesn't exist, sign him up
                const authDto = new AuthDto();
                authDto.username = username;
                authDto.password = `42st4d3nt${infos.id}`; // Generates password according to pattern
                return await this.signUp(authDto);
            }
        } catch (error) {
            console.error('Erreur:', error);
            return null;
        }
    }

    // A mettre en private ?

    // This function will be used to get the user's information from the token
    async getInfoFromToken(token: string) {
        const url = 'https://api.intra.42.fr/v2/me';
        const accessToken = token;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return null; // A modifier peut etre ?
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
