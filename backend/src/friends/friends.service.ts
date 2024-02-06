import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class FriendService {
    constructor(private databaseService: DatabaseService) { }

    async createFriendRequest(initiatorId: number, receiverId: number) {
        if (initiatorId === receiverId)
            throw new ForbiddenException('Cannot send friend request to yourself');
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

        if (existingFriendship) {
            throw new ConflictException('Friendship already exists');
        }

        return this.databaseService.friendship.create({
            data: {
                initiatorId,
                receiverId,
                status: "PENDING",
            },
        });
    }

    async getFriendships(userId: number) {
        await this.checkUserExistence(userId);

        return this.databaseService.friendship.findMany({
            where: {
                OR: [
                    { initiatorId: userId },
                    { receiverId: userId },
                ],
            },
			include: {
				initiator: {
					select: {
						username: true,
						avatar: true,
					}
				},
				receiver: {
					select: {
						username: true,
						avatar: true,
					}
				}

			}
        });
    }

    async acceptFriendRequest(friendshipId: number, userId: number) {
        const friendship = await this.databaseService.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) {
            throw new NotFoundException('Friendship not found');
        }
        if (friendship.receiverId !== userId) {
            throw new ForbiddenException('You cannot accept this friend request');
        }
        return this.databaseService.friendship.update({
            where: { id: friendshipId },
            data: { status: "ACCEPTED" },
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

    private async checkUserExistence(userId: number): Promise<void> {
        const user = await this.databaseService.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }
    }
}