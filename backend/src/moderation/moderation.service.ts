import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from "src/database/database.service";
import { Role } from '@prisma/client';


@Injectable()
export class ModerationService {
	constructor(
		private readonly databaseService: DatabaseService,
		private eventEmitter: EventEmitter2,
	) { }

	async banUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === Role.OWNER) throw new UnauthorizedException('You cannot ban the owner');
		const banUser = await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				role: Role.BANNED,
			}
		});
		this.eventEmitter.emit("ban.user", { userId, roomId });
		return banUser;
	}

	async kickUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === Role.OWNER) throw new UnauthorizedException('You cannot kick the owner');
		const kickUser = await this.databaseService.channelUser.delete({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				}
			}
		});
		this.eventEmitter.emit("kick.user", { userId, roomId });
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
				role: Role.MEMBER,
			}
		});
		return banUser;
	}

	async promoteUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === Role.OWNER) throw new UnauthorizedException('You cannot promote the owner');
		this.eventEmitter.emit("user.role", { userId, roomId, role: `${Role.ADMIN}` });
		return await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				role: Role.ADMIN,
			}
		});
	}

	async demoteUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === Role.OWNER) throw new UnauthorizedException('You cannot demote the owner');
		this.eventEmitter.emit("user.role", { userId, roomId, role: `${Role.MEMBER}` });
		return await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				role: Role.MEMBER,
			}
		});
	}

	async muteUser(userId: number, roomId: string) {
		const userRole = await this.getRole(userId, roomId);
		if (userRole === Role.OWNER) throw new UnauthorizedException('You cannot mute the owner');
		const muted = await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				muted: true,
			}
		});
		this.eventEmitter.emit("user.muted", userId, roomId, true);
		return muted;
	}

	async unmuteUser(userId: number, roomId: string) {
		const unmuteUser =  await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				muted: false,
			}
		});
		this.eventEmitter.emit("user.muted", userId, roomId, false);
		return unmuteUser;
	}

	async setOwnership(userId: number, roomId: string) {
		return await this.databaseService.channelUser.update({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			},
			data: {
				role: Role.OWNER,
			}
		});
	}

	async isMuted(userId: number, roomId: string) {
		const user = await this.databaseService.channelUser.findUnique({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			}
		});
		if (!user) throw new NotFoundException('User not found');
		return (user.muted);
	}

	async getRole(userId: number, roomId: string) {
		const user = await this.databaseService.channelUser.findUnique({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			}
		})
		if (!user) throw new NotFoundException('User not found');
		return (user.role);
	}
}