import { Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserService } from './user.service';
import { FriendService } from './friends.service';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly friendService: FriendService,
    ) { }

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        return req.user;
    }

    @Get('friends')
    @UseGuards(JwtGuard)
    getFriends(@Req() req: Request) {
        return this.friendService.getFriendships((req.user as { id: number }).id);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserById(id)
    }

    @Get(':id/channels')
    findUserChannels(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserChannels(id)
    }


    @Post(':id/friends')
    @UseGuards(JwtGuard)
    createFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        return this.friendService.createFriendRequest((req.user as { id: number }).id, id);
    }

    @Post(':id/friends/accept')
    @UseGuards(JwtGuard)
    acceptFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        return this.friendService.acceptFriendRequest(id, (req.user as { id: number }).id);
    }

    @Delete(':id/friends/decline')
    @UseGuards(JwtGuard)
    declineFriendRequest(@Param('id', ParseIntPipe) id: number) {
        return this.friendService.declineFriendRequest(id);
    }

}
