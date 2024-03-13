import { Body, Controller, Get, Param, Query, Post, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { CreateStatsDto } from '../dto/create-stats.dto';
import { UpdateStatsDto } from '../dto/update-stats.dto';
import { ValidationPipe } from '@nestjs/common';
import { CreateMatchDto } from '../dto/create-match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { Prisma } from '@prisma/client';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('history')
    findAllGames(@Query('id') id?: number) {
        return this.gameService.findAllGames(+id);
    }

    @Post('history')
    createGame(@Body(ValidationPipe) createMatchDto: CreateMatchDto) {
        return this.gameService.createMatch(createMatchDto);
    }

    @Patch('history/:id_match')
    updateGame(@Param('id_match') id_match : string, @Body(ValidationPipe) updateMatchDto: UpdateMatchDto) {
        return this.gameService.updateMatch(+id_match, updateMatchDto);
    }
}

