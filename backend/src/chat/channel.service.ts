import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ChannelMessageDto } from './dto/channelMessage.dto';
import * as argon from 'argon2';
import { JoinChannelDto } from './dto/joinChannel.dto';
import { Certificate } from 'crypto';

@Injectable()
export class ChannelService {
	constructor(private readonly databaseService: DatabaseService) {}

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
			data: createChannelMessageDto
		});
		return channelMessage;
	}

	async findMessages(name: string) {
		return await this.databaseService.channelMessage.findMany({
			where: {
				channelId: name,
			}
		})
	}
}