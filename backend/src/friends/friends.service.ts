import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { FriendshipStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

const friendInclude = {
    initiator: {
        select: {
            id: true,
            username: true,
            avatar: true,
            status: true,
        },
    },
    receiver: {
        select: {
            id: true,
            username: true,
            avatar: true,
            status: true,
        },
    },
};

@Injectable()
export class FriendService {
    constructor(private databaseService: DatabaseService,
		private eventEmitter: EventEmitter2,
	) { }

    async createFriendRequest(initiatorId: number, receiverId: number) {
        if (initiatorId === receiverId) throw new ForbiddenException('Cannot send friend request to yourself');
        await this.checkUserExistence(initiatorId);
        await this.checkUserExistence(receiverId);

        const exist = await this.databaseService.friendship.findFirst({
            where: {
                OR: [
					{
						initiatorId: initiatorId,
						receiverId: receiverId,
					},
					{
						initiatorId: receiverId,
						receiverId: initiatorId,
					},
				]
            },
        });
		if (exist) {
			if (exist.status === FriendshipStatus.ACCEPTED) throw new ConflictException('You are already friends');
			if (exist.status === FriendshipStatus.PENDING && exist.initiatorId === initiatorId) throw new ConflictException('Friend request already sent');
			if (exist.status === FriendshipStatus.PENDING && exist.receiverId === initiatorId) throw new ConflictException('You have already received a friend request from this user');
			if (exist.status === FriendshipStatus.BLOCKED && exist.initiatorId === initiatorId) throw new ForbiddenException('You have blocked this user');
			if (exist.status === FriendshipStatus.BLOCKED && exist.receiverId === initiatorId) throw new ForbiddenException('You have been blocked by this user');
			else throw new ConflictException('Friendship already exists');
		}

        const friendship = await this.databaseService.friendship.create({
            data: {
                initiatorId,
                receiverId,
                status: FriendshipStatus.PENDING,
            },
			include: friendInclude,
        });
		this.eventEmitter.emit('friendship.update', friendship);
		return friendship;
    }

    async getFriendships(userId: number) {
        await this.checkUserExistence(userId);

        return await this.databaseService.friendship.findMany({
            where: {
                OR: [
                    { initiatorId: userId },
                    { receiverId: userId },
                ],
            },
			include: friendInclude,
        });
    }

    async acceptFriendRequest(friendshipId: number, userId: number) {
        const friendship = await this.databaseService.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) throw new NotFoundException('Friendship not found');
        if (friendship.receiverId !== userId) throw new ForbiddenException('You cannot accept this friend request');
        const updatedFriendship = await this.databaseService.friendship.update({
            where: { id: friendshipId },
            data: { status: FriendshipStatus.ACCEPTED },
			include: friendInclude,
        });
		this.eventEmitter.emit('friendship.update', updatedFriendship);
		return updatedFriendship;
    }

    async deleteFriend(friendshipId: number) {
        const friendship = await this.databaseService.friendship.findUnique({
            where: { id: friendshipId },
			include: friendInclude,
        });

        if (!friendship) {
            throw new NotFoundException('Friendship not found');
        }

        const deleteFriend = this.databaseService.friendship.delete({
            where: { id: friendshipId },
        });
		this.eventEmitter.emit('friendship.delete', friendship);
		return deleteFriend;
    }

	async blockUser(userId: number, blockedUserId: number) {
		const friendshipToDelete = await this.databaseService.friendship.findFirst({
			where: {
				OR: [
					{ initiatorId: userId, receiverId: blockedUserId },
					{ initiatorId: blockedUserId, receiverId: userId },
				],
				NOT : { status: FriendshipStatus.BLOCKED },
			},
			include: friendInclude,
		});
		if (friendshipToDelete) {
			await this.databaseService.friendship.delete({
				where: { id: friendshipToDelete.id },
			});
			this.eventEmitter.emit('friendship.delete', friendshipToDelete);
		}
		const alreadyBlocked = await this.databaseService.friendship.findFirst({
			where: {
				initiatorId: userId,
				receiverId: blockedUserId,
				status: FriendshipStatus.BLOCKED,
			},
		});
		if (alreadyBlocked) throw new ConflictException('User already blocked');
		return await this.databaseService.friendship.create({
			data: {
				initiatorId: userId,
				receiverId: blockedUserId,
				status: FriendshipStatus.BLOCKED,
			},
		});
	}

	async findBlockedUsers(userId: number) {
		return await this.databaseService.friendship.findMany({
			where: {
				initiatorId: userId, 
				status: FriendshipStatus.BLOCKED,
			},
		});
	}

	async findBlockedByUsers(userId: number) {
		return await this.databaseService.friendship.findMany({
			where: {
				receiverId: userId,
				status: FriendshipStatus.BLOCKED,
			},
		});
	}

    private async checkUserExistence(userId: number) {
        const user = await this.databaseService.user.findUnique({
            where: { id: userId },
        });
        if (!user) throw new NotFoundException('User not found');
		return true;
    }
}