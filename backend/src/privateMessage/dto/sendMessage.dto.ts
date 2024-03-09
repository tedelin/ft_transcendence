import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PrivateMessageDto {
	@IsNumber()
	receiverId: number;

	@IsString()
	@IsNotEmpty()
	content: string;
}