import {IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	password?: string;

	visibility: Visibility;
}

export class JoinChannelDto {
	@IsString()
	@IsNotEmpty()
	roomId: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	password?: string
}

export class ChannelMessageDto {
	@IsNumber()
	senderId: number;

	@IsString()
	@IsNotEmpty()
	channelId: string;

	@IsString()
	@IsNotEmpty()
	content: string;
}