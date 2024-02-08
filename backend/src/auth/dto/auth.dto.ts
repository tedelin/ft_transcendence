import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class twoFaDto {
    readonly token: string;
}
