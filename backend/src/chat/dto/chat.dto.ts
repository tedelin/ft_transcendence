import {IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	password?: string;

	@IsString()
	@IsOptional()
	visibility?: string;
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