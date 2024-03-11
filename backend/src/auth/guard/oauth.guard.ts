import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class OAuthGuard extends AuthGuard('oauth') {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const accessToken = request.headers.authorization;
		if (!accessToken) throw new UnauthorizedException('Access token not provided');

		try {
			const response = await fetch('https://api.intra.42.fr/v2/me', {
				method: 'GET',
				headers: {
					'Authorization': accessToken
				}
			});
			if (!response.ok) throw new UnauthorizedException('Invalid access token');
			const user = await response.json();
			request.user = user;
			return true;
		} catch (error) {
			throw new UnauthorizedException('Failed to verify access token');
		}
	}
}