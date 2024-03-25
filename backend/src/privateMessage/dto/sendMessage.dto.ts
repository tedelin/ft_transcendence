import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class PrivateMessageDto {
	@IsNumber()
	receiverId: number;

	@IsString()
	@MaxLength(1500)
	@IsNotEmpty()
	content: string;
}