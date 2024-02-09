import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ChannelMessageDto } from './dto/channelMessage.dto';
import { JoinChannelDto } from './dto/joinChannel.dto';
import { FriendService } from 'src/friends/friends.service';
import * as argon from 'argon2';

@Injectable()
export class ChannelService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly friendService: FriendService,
	) {}

    async create(createChannelDto: Prisma.ChannelCreateInput) {
		if (createChannelDto.name === '') {
			throw new ConflictException('Channel name is empty');
		}
		const exist = await this.findByName(createChannelDto.name);
		if (exist) {
			throw new ConflictException('Channel name already exists');
		}
		if (createChannelDto.password !== '') {
			const hash = await argon.hash(createChannelDto.password);
			createChannelDto.password = hash;
		}
		return this.databaseService.channel.create({
			data: createChannelDto
        });
    }

	async joinChannel(joinChannelDto: JoinChannelDto) {
		const exist = await this.databaseService.channelUser.findFirst({
			where: {
				userId: joinChannelDto.userId,
				channelName: joinChannelDto.roomId,
			}
		});
		if (exist && exist.role === 'BANNED') {
			throw new ConflictException('You are banned from this channel');
		}
		return await this.databaseService.channelUser.create({
			data: {
				userId: joinChannelDto.userId,
				channelName: joinChannelDto.roomId,
			}
		})
	}

	async findPublicChannels() {
		return await this.databaseService.channel.findMany({
			where: {
				visibility: 'public',
			},
			select: {
				name: true,
				visibility: true,
				password: false,
				messages: false,
			}
		});
	}

	async findAll() {
		return await this.databaseService.channel.findMany({
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

    async update(name: string, updateChannelDto: Prisma.ChannelUpdateInput) {
        return await this.databaseService.channel.update({
            where: {
                name,
            },
            data: updateChannelDto,
        })
    }

    async remove(name: string) {
        return await this.databaseService.channel.delete({
            where: {
                name,
            }
        })
    }

	async createMessage(createChannelMessageDto: ChannelMessageDto) {
		const channelMessage = await this.databaseService.channelMessage.create({
			data: createChannelMessageDto,
			include: {
				sender: {
					select: {
						username: true,
						avatar: true,
					}
				}
			}
		});
		return channelMessage;
	}

	async findMessages(userId: number, name: string) {
		const blockedUser = await this.friendService.findBlockedUsers(userId);
		return await this.databaseService.channelMessage.findMany({
			where: {
				channelId: name,
				senderId: {
					notIn: blockedUser.map(friend => friend.receiverId)
				}
			},
			include: {
				sender: {
					select: {
						username: true,
						avatar: true,
					}
				}
			}
		});
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

	async banUser(userId: number, roomId: string) {
		return await this.databaseService.channelUser.update({
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
	}

	async kickUser(userId: number, roomId: string) {
		return await this.databaseService.channelUser.delete({
			where: {
				channelName_userId: {
					channelName: roomId,
					userId: userId,
				}
			}
		});
	}
}