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

    // @Get('stats/:id_user')   // GET /game/stats/id
    // getStats(@Param('id_user') id_user : number) {
    //     return this.gameService.getStats(+id_user);
    // }

    // @Post('stats')      // POST /game/stats
    // createStats(@Body(ValidationPipe) createStatsDto: Prisma.StatsCreateInput) {
    //     return this.gameService.createStats(createStatsDto);
    // }

    // @Patch('stats/:id_user') // PATCH /game/stats/id
    // updateStats(@Param('id_user') id_user : number, @Body(ValidationPipe) updateStatsDto : Prisma.StatsUpdateInput) {
    //     return this.gameService.updateStats(+id_user, updateStatsDto);
    // }

    @Get('history')       // GET /game/history OU /game/history?id=id
    findAllGames(@Query('id') id?: number) {
        return this.gameService.findAllGames(+id);
    }

    @Post('history')       // POST /game/history
    createGame(@Body(ValidationPipe) createMatchDto: CreateMatchDto) {
        return this.gameService.createMatch(createMatchDto);
    }

    @Patch('history/:id_match')   // PATCH /game/history/id
    updateGame(@Param('id_match') id_match : string, @Body(ValidationPipe) updateMatchDto: UpdateMatchDto) {
        return this.gameService.updateMatch(+id_match, updateMatchDto);
    }
}

