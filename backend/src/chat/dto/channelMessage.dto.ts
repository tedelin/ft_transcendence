import { IsNotEmpty, IsNumber, IsString } from "class-validator";


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