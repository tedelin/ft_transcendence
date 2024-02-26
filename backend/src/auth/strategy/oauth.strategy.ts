import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-oauth2';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
  constructor() {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): Promise<any> {
    try {
      const response = await fetch('https://api.intra.42.fr/v2/me', {
		method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
	  const data = await response.json();

      const user = {
        id: data.id,
        username: data.login,
        email: data.email,
      };

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}