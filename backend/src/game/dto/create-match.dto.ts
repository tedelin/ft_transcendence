import { IsInt, IsEnum, Min, ArrayNotEmpty, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { playerRole } from '@prisma/client';

class PlayerData {
  @IsInt()
  playerId: number;

  @IsInt()
  score: number;

  @IsEnum(playerRole)
  role: playerRole;
}

export class CreateMatchDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => PlayerData)
  players: PlayerData[];
}