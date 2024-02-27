import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class SignUpDto {
	@IsString()
	@IsNotEmpty()
	username: string;
}

export class twoFaCodeDto {
	@IsString()
	@IsNotEmpty()
	code: string;
}

export class twoFaDto {
    readonly token: string;
}

export class totpDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    totp: string;
}

export class TokenTotpDto {
    @IsString()
    @IsNotEmpty()
    totp: string;
}
