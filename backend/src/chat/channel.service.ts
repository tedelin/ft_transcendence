import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, Visibility, Role } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ChannelMessageDto, CreateChannelDto, UpdateChannelDto } from './dto/chat.dto';
import { JoinChannelDto } from './dto/chat.dto';
import { FriendService } from 'src/friends/friends.service';
import { ModerationService } from 'src/moderation/moderation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon from 'argon2';

@Injectable()
export class ChannelService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly friendService: FriendService,
		private eventEmitter: EventEmitter2,
		private readonly moderationService: ModerationService,
	) { }

	async create(userId, createChannelDto: CreateChannelDto) {
		const exist = await this.findByName(createChannelDto.name);
		if (exist) throw new ConflictException('Channel name already exists');
		if (createChannelDto.password) {
			const hash = await argon.hash(createChannelDto.password);
			createChannelDto.password = hash;
		}
		const channel = await this.databaseService.channel.create({
			data: createChannelDto,
		});
		this.eventEmitter.emit('new.channel', createChannelDto);
		await this.databaseService.channelUser.create({
			data: {
				channelName: channel.name,
				role: Role.OWNER,
				userId: userId,
			},
		});
		this.eventEmitter.emit("join.channel", userId, createChannelDto.name);
		return channel;
	}

	async joinChannel(userId: number, joinChannelDto: JoinChannelDto) {
		const channel = await this.databaseService.channel.findUnique({
			where: {
				name: joinChannelDto.roomId,
				visibility: joinChannelDto.visibility,
			}
		});
		if (!channel) throw new NotFoundException("Channel doesn't exist");
		const alreadyJoined = await this.databaseService.channelUser.findFirst({
			where: {
				userId: userId,
				channelName: joinChannelDto.roomId,
			}
		});
		if (alreadyJoined && alreadyJoined.role === Role.BANNED) throw new ConflictException('You are banned from this channel');
		if (alreadyJoined) return alreadyJoined;
		if (channel.visibility === Visibility.PROTECTED) {
			if (!joinChannelDto.password) throw new ForbiddenException("Password required");
			const pwMatches = await argon.verify(channel.password, joinChannelDto.password);
			if (!pwMatches) {
				throw new ForbiddenException("Wrong password");
			}
		}
		const channelUser = await this.databaseService.channelUser.create({
			data: {
				userId: userId,
				channelName: joinChannelDto.roomId,
				role: Role.MEMBER,
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar: true,
					}
				}
			}
		})
		this.eventEmitter.emit('join.channel', userId, joinChannelDto.roomId, channelUser);
		return channelUser;
	}

	async leaveChannel(userId: number, roomId: string) {
		const channel = await this.findByName(roomId);
		if (!channel) throw new NotFoundException("Channel doesn't exist");
		const user = await this.databaseService.channelUser.findUnique({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				},
			}
		})
		if (!user) throw new NotFoundException("You are not in this channel");
		this.eventEmitter.emit('leave.channel', userId, roomId);
		if (user.role === Role.OWNER) {
			const newOwner = await this.databaseService.channelUser.findFirst({
				where: {
					channelName: roomId,
					OR: [
						{ role: Role.MEMBER },
						{ role: Role.ADMIN }
					  ]
				},
				select: {
					userId: true,
				}
			});
			if (!newOwner) return this.remove(roomId);
			else {
				this.moderationService.setOwnership(newOwner.userId, roomId);
				this.eventEmitter.emit('user.role', { userId: newOwner.userId, roomId, role: Role.OWNER });
			}
		}
		return await this.databaseService.channelUser.delete({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				}
			}
		})
	}

	async findPublicChannels() {
		return await this.databaseService.channel.findMany({
			where: {
				visibility: Visibility.PUBLIC,
			},
			select: {
				name: true,
				visibility: true,
				password: false,
				messages: false,
			}
		});
	}

	async findByName(name: string) {
		return await this.databaseService.channel.findUnique({
			where: {
				name,
			},
			select: {
				name: true,
				visibility: true,
				password: true,
				messages: false,
			}
		});
	}

	async update(name: string, updateChannelDto: UpdateChannelDto) {
		if (updateChannelDto.password) {
			const password = updateChannelDto.password as string;
			const hash = await argon.hash(password);
			updateChannelDto.password = hash;
		}
		return await this.databaseService.channel.update({
			where: {
				name,
			},
			data: updateChannelDto,
		})
	}

	private async remove(name: string) {
		await this.databaseService.channelUser.deleteMany({
			where: {
				channelName: name,
			}
		});
		await this.databaseService.channelMessage.deleteMany({
			where: {
				channelId: name,
			}
		});
		this.eventEmitter.emit('delete.channel', name);
		return await this.databaseService.channel.delete({
			where: {
				name,
			}
		})
	}

	async createMessage(channelMessage: ChannelMessageDto) {
		const userMuted = await this.moderationService.isMuted(channelMessage.senderId, channelMessage.channelId);
		if (userMuted) throw new ForbiddenException('You have been muted');
		const message = await this.databaseService.channelMessage.create({
			data: channelMessage,
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						avatar: true,
					}
				},
			}
		});
		this.eventEmitter.emit("channel.message", channelMessage, message);
		return message;
	}

	async findMessages(userId: number, name: string, offset: number) {
		const blockedUser = await this.friendService.findBlockedUsers(userId);
		const messages = await this.databaseService.channelMessage.findMany({
			take: 40,
			skip: offset,
			where: {
				channelId: name,
				senderId: {
					notIn: blockedUser.map(friendship => friendship.receiverId)
				}
			},
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						avatar: true,
					}
				}
			},
			orderBy: {
				timestamp: 'desc',
			}
		});
		return messages.reverse();
	}

	async findChannelUsers(name: string) {
		return await this.databaseService.channelUser.findMany({
			where: {
				channelName: name,
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar: true,
					}
				}
			}
		});
	}

	async searchPublicChannels(query: string) {
		return await this.databaseService.channel.findMany({
			take: 11,
			where: {
				visibility: Visibility.PUBLIC,
				...(query
					? {
						name: {
							contains: query,
						},
					}
					: {}),
			},
			select: {
				name: true,
				visibility: true,
				password: false,
				messages: false,
			}
		});

	}

	async verifyMembership(userId: number, name: string) {
		const channel = await this.findByName(name);
		if (!channel) return { exist: false };
		const user = await this.databaseService.channelUser.findFirst({
			where: {
				userId,
				channelName: name,
			}
		});
		if (user?.role === Role.BANNED) return { exist: true, member: false, banned: true };
		return { exist: true, member: !!user, banned: false };
	}
}