import { Injectable, UnauthorizedException } from "@nestjs/common";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from "src/database/database.service";


@Injectable()
export class ModerationService {
	constructor(
		private readonly databaseService: DatabaseService,
		private eventEmitter: EventEmitter2,
	) {}

	async banUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === 'OWNER') throw new UnauthorizedException('You cannot ban the owner');
		const banUser = await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				role: 'BANNED',
			}
		});
		this.eventEmitter.emit("ban.user", {userId, roomId});
		return banUser;
	}

	async kickUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === 'OWNER') throw new UnauthorizedException('You cannot kick the owner');
		const kickUser = await this.databaseService.channelUser.delete({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				}
			}
		});
		this.eventEmitter.emit("kick.user", {userId, roomId});
		return kickUser;
	}

	async unbanUser(userId: number, roomId: string) {
		const banUser = await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				role: 'MEMBER',
			}
		});
		return banUser;
	}

	async promoteUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === 'OWNER') throw new UnauthorizedException('You cannot demote the owner');
		return await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				role: 'ADMIN',
			}
		});
	}

	async demoteUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === 'OWNER') throw new UnauthorizedException('You cannot demote the owner');
		return await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				role: 'MEMBER',
			}
		});
	}

	async getRole(userId: number, roomId: string) {
		const channel = await this.databaseService.channelUser.findUnique({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			}
		})
		return (channel.role);
	}
}