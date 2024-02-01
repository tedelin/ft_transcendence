import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Get('all') 
    findAll() {
        return this.userService.findAll();
    }

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        return req.user;
    }
	
	@Get('username/:username')
	getUserByName(@Param('username') username: string) {
		return this.userService.getUserByUsername(username);
	}

	@Get('id/:id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.userService.getUserById(id)
	}

    @Get(':id/channels')
    findUserChannels(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserChannels(id)
    }
}
