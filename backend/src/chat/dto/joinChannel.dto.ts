import {IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class JoinChannelDto {
	@IsString()
	@IsNotEmpty()
	roomId: string;

	@IsString()
	@IsOptional()
	password?: string

	@IsNumber()
	@IsNotEmpty()
	userId: number;
}