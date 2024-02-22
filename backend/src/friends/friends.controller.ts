import { Controller, Patch, Get, Param, ParseIntPipe, Post, Req, UseGuards, Delete } from '@nestjs/common';
import { FriendService  } from "./friends.service";
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';
import { UserRequest, User } from '../user/decorators/user-request.decorator';


@Controller('friends')
export class FriendController {
	constructor(private readonly friendService: FriendService) { }

	@Get('all')
	@UseGuards(JwtGuard)
	getFriends(@UserRequest() user: User) {
		return this.friendService.getFriendships(user.id);
	}
	
	@Post(':id')
	@UseGuards(JwtGuard)
	createFriendRequest(@UserRequest() user: User, @Param('id', ParseIntPipe) id: number) {
		return this.friendService.createFriendRequest(user.id, id);
	}

	@Patch('block/:id')
	@UseGuards(JwtGuard)
	blockFriend(@UserRequest() user: User, @Param('id', ParseIntPipe) id: number) {
		return this.friendService.blockUser(user.id, id);
	}

	@Post('accept/:id')
	@UseGuards(JwtGuard)
	acceptFriendRequest(@UserRequest() user: User, @Param('id', ParseIntPipe) id: number) {
		return this.friendService.acceptFriendRequest(id, user.id);
	}

	@Delete('delete/:id')
	@UseGuards(JwtGuard)
	deleteFriend(@Param('id', ParseIntPipe) id: number) {
		return this.friendService.deleteFriend(id);
	}
}