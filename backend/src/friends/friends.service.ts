import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendService {
    constructor(private databaseService: DatabaseService) { }

    async createFriendRequest(initiatorId: number, receiverId: number) {
        if (initiatorId === receiverId) throw new ForbiddenException('Cannot send friend request to yourself');
        await this.checkUserExistence(initiatorId);
        await this.checkUserExistence(receiverId);

        const existingFriendship = await this.databaseService.friendship.findUnique({
            where: {
                initiatorId_receiverId: {
                    initiatorId,
                    receiverId,
                },
            },
        });

        if (existingFriendship) throw new ConflictException('Friendship already exists');

        return await this.databaseService.friendship.create({
            data: {
                initiatorId,
                receiverId,
                status: FriendshipStatus.PENDING,
            },
        });
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
			include: {
				initiator: {
					select: {
						id: true,
						username: true,
						avatar: true,
						status: true,
					}
				},
				receiver: {
					select: {
						id: true,
						username: true,
						avatar: true,
						status: true,
					}
				}

			}
        });
    }

    async acceptFriendRequest(friendshipId: number, userId: number) {
        const friendship = await this.databaseService.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) throw new NotFoundException('Friendship not found');
        if (friendship.receiverId !== userId) throw new ForbiddenException('You cannot accept this friend request');
        return await this.databaseService.friendship.update({
            where: { id: friendshipId },
            data: { status: FriendshipStatus.ACCEPTED },
        });
    }

    async deleteFriend(friendshipId: number) {
        const friendship = await this.databaseService.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) {
            throw new NotFoundException('Friendship not found');
        }

        return this.databaseService.friendship.delete({
            where: { id: friendshipId },
        });
    }

	async blockUser(userId: number, blockedUserId: number) {
		await this.databaseService.friendship.deleteMany({
			where: {
				OR: [
					{ initiatorId: userId, receiverId: blockedUserId },
					{ initiatorId: blockedUserId, receiverId: userId },
				],
			},
		});
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