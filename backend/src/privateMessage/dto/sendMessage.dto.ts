import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
