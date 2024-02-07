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
// token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoidGVzdCIsImlhdCI6MTcwNzMzMzA1OX0.ynLz-5kN78C1H39Mv7mHSitcsoQ8FZhXoukPp076s9k