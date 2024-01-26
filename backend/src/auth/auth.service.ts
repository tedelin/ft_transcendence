import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2'
import { DatabaseService } from '../database/database.service';
import { Prisma} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';


@Injectable({})
export class AuthService{
	constructor(private databaseService : DatabaseService, private jwtService: JwtService, private configService: ConfigService) {}
	async signUp(authDto : AuthDto) {
		try{
			authDto.password = await argon.hash(authDto.password)
			const user = await this.databaseService.user.create({
				data: authDto,
			})
			return this.signToken(user.id, user.username);
		}
		catch(error) {
			console.log(error);
			if (error instanceof Prisma.PrismaClientKnownRequestError){
				if (error.code === "P2002"){
					throw new ForbiddenException("Credential taken");
				}
			}
			else
				throw error
		}
	}

	async login(loginUserDto: AuthDto) {
		const user = await this.databaseService.user.findUnique({
			where: {
				username: loginUserDto.username
			}
		});
		if (!user) {
			throw new ForbiddenException('Invalid credentials');
		}
		const isPasswordValid = await argon.verify(user.password, loginUserDto.password);
		if (!isPasswordValid) {
			throw new ForbiddenException('Invalid credentials');
		}
		return this.signToken(user.id, user.username);
	}

	// This function will be used to sign a token for the client
	// The token will be used to authenticate the client and it will be used by the client
	async signToken(userId: number, username: string) : Promise<{access_token :string}>{ 
		const payload = {
			sub: userId, 
			username
		} 
		const secret = this.configService.get<string>('JWT_SECRET')
		const token = await this.jwtService.signAsync(payload, {secret: secret})

		return { access_token : token } // Return an object token to the client
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