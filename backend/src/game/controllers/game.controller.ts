import { Body, Controller, Get, Param, Query, Post, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { CreateStatsDto } from '../dto/create-stats.dto';
import { UpdateStatsDto } from '../dto/update-stats.dto';
import { ValidationPipe } from '@nestjs/common';
import { CreateHistoryDto } from '../dto/create-history.dto';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('stats/:id_user')   // GET /game/stats/id
    getStats(@Param('id_user') id_user : string) {
        return this.gameService.getStats(id_user);
    }

    @Post('stats')      // POST /game/stats
    createStats(@Body(ValidationPipe) createStatsDto: CreateStatsDto) {
        return this.gameService.createStats(createStatsDto);
    }

    @Patch('stats/:id_user') // PATCH /game/stats/id
    updateStats(@Param('id_user') id_user : string, @Body(ValidationPipe) updateStatsDto : UpdateStatsDto) {
        return this.gameService.updateStats(id_user, updateStatsDto);
    }

    @Get('history')       // GET /game/history OU /game/history?id=id
    findAllGames(@Query('id') id?: string) {
        return this.gameService.findAllGames(id);
    }

    @Post('history')       // POST /game/history
    createGame(@Body(ValidationPipe) createHistoryDto: CreateHistoryDto) {
        return this.gameService.createGame(createHistoryDto);
    }
}

