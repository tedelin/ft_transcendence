import { Controller, Patch, Get, Param, ParseIntPipe, Post, Req, UseGuards, Delete } from '@nestjs/common';
import { FriendService  } from "./friends.service";
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';


@Controller('friends')
export class FriendController {
	constructor(private readonly friendService: FriendService) { }

	@Get('all')
	@UseGuards(JwtGuard)
	getFriends(@Req() req: Request) {
		return this.friendService.getFriendships((req.user as { id: number }).id);
	}
	
	@Post(':id')
	@UseGuards(JwtGuard)
	createFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
		return this.friendService.createFriendRequest((req.user as { id: number }).id, id);
	}

	@Patch('block/:id')
	@UseGuards(JwtGuard)
	blockFriend(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
		return this.friendService.blockUser((req.user as { id: number }).id, id);
	}

	@Post('accept/:id')
	@UseGuards(JwtGuard)
	acceptFriendRequest(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
		return this.friendService.acceptFriendRequest(id, (req.user as { id: number }).id);
	}

	@Delete('delete/:id')
	@UseGuards(JwtGuard)
	deleteFriend(@Param('id', ParseIntPipe) id: number) {
		return this.friendService.deleteFriend(id);
	}
}