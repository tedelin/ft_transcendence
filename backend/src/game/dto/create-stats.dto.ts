import { IsString, IsNotEmpty, IsInt } from "class-validator";

export class CreateStatsDto {
    id: number
    @IsString()
    @IsNotEmpty()
    user_id: string

    @IsInt()
    played: number

    @IsInt()
    win: number
}