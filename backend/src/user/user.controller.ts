import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        // Can get user from request object (req.user)
        return req.user;
    }

	@Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserById(id)
    }

	@Get(':id/channels')
	findUserChannels(@Param('id', ParseIntPipe) id: number) {
		return this.userService.getUserChannels(id)
	}
}
