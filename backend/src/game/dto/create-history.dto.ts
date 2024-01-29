import { IsString, IsNotEmpty, IsInt } from "class-validator";

export class CreateHistoryDto {
    id: number
    date: string

    @IsString()
    @IsNotEmpty()
    P1_id: string

    @IsString()
    @IsNotEmpty()
    P2_id: string

    @IsInt()
    P1_score: number

    @IsInt()
    P2_score: number
}