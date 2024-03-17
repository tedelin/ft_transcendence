import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, MinLength, Max, MaxLength, IsAlphanumeric } from 'class-validator';
import { FriendshipStatus, Visibility } from '@prisma/client';

export class CreateChannelDto {
	@IsString()
	@IsAlphanumeric()
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

	@IsString()
	@IsNotEmpty()
	visibility: Visibility;
}

export class ChannelMessageDto {
	@IsNumber()
	senderId: number;

	@IsString()
	@IsNotEmpty()
	channelId: string;

	@IsString()
	@MaxLength(1500)
	@IsNotEmpty()
	content: string;
}

export class FriendShipRequestDto {
	@IsNumber()
	id: number;

	@IsNumber()
	initiatorId: number;

	@IsNumber()
	receiverId: number;

	@IsNotEmpty()
	@IsString()
	status: FriendshipStatus;
}