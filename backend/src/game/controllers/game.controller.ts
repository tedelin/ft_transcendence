import { Controller, Get, Req } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { Request } from 'express';

@Controller('game')
export class GameController {
    constructor(private readonly roomService: GameService) {}
    
    @Get()
    findAll(@Req() request: Request) {
        return 'yo les gros';
    }
}

