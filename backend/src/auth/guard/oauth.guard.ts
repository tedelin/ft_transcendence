import { AuthGuard } from '@nestjs/passport';

export class OAuthGuard extends AuthGuard('oauth') {
    constructor() {
        super();
    }
}
