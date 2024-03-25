import { IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength, Matches } from 'class-validator';

export class AuthDto {
    @IsString()
    @IsNotEmpty()
	@MinLength(4)
	@MaxLength(12)
    username: string;

    @IsString()
    @IsNotEmpty()
	@MinLength(8)
	@MaxLength(30)
    password: string;
}

export class SignUpDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(4)
	@MaxLength(12)
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

export class UserUpdateDto {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@MinLength(4)
	@MaxLength(14)
	@Matches(/^[a-zA-Z0-9._-]+$/, { message: 'Username contains forbidden caracters' })
	username: string;

	@IsString()
    @IsOptional()
    @MaxLength(255)
    @Matches(/^[a-zA-Z0-9\s.,!'"+_-]*$/, { message: 'Bio contains forbidden caracters' })
    bio: string;
}