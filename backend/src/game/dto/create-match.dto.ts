import { IsInt, IsEnum, Min, ArrayNotEmpty, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { playerRole } from '@prisma/client';
import { gameStatus } from '@prisma/client';

export class PlayerData {
  @IsInt()
  playerId: number;

  @IsInt()
  score: number;

  @IsEnum(playerRole)
  role: playerRole;
}

export class CreateMatchDto {
  @IsEnum(gameStatus)
  status: gameStatus;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => PlayerData)
  players: PlayerData[];
}

export class Player {
  id: string;
  avatar: string;
}