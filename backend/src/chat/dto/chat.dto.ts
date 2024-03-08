import {IsString, IsOptional, IsNotEmpty, IsNumber, Min, MinLength, Max, MaxLength } from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(4)
	@MaxLength(20)
	name: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(30)
	password?: string;

	visibility: Visibility;
}

export class UpdateChannelDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(4)
	@MaxLength(20)
	name: string;

	visibility: Visibility;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(30)
	password?: string;
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