import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Req,
	UseGuards,
	Post,
	UploadedFile,
	UseInterceptors,
	NotFoundException,
	StreamableFile,
	Query,
	Body,
	BadRequestException
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { UserUpdateDto } from 'src/auth/dto/auth.dto';

@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService,
	) { }

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@Req() req: Request) {
		return req.user;
	}

	@UseGuards(JwtGuard)
	@Get('')
	searchUser(@Query('search') query: string = '') {
		return this.userService.searchUser(query);
	}

	@Get('id/:id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.userService.getUserById(id);
	}

	@Get(':id/channels')
	findUserChannels(@Param('id', ParseIntPipe) id: number) {
		return this.userService.getUserChannels(id);
	}

    @Get('profilData/:id')
    getProfilData(@Param('id', ParseIntPipe) id: number){
        return this.userService.getProfilData(id);
    }

	@Post('upload-change')
	@UseInterceptors(FileInterceptor('avatar', {
	  storage: diskStorage({
		destination: './uploads/avatars',
		filename: (req, file, cb) => {
		  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(file.originalname)}`;
		  cb(null, uniqueName);
		}
	  }),
	  limits: { fileSize: 2 * 1024 * 1024 },
	  fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		  return cb(new BadRequestException('Only pictures are allowed jpg jpeg png gif'), false);
		}
		cb(null, true);
	  },
	}))
	@UseGuards(JwtGuard)
	async uploadChange(
	  @UploadedFile() file: Express.Multer.File,
	  @Req() req,
	  @Body() userUpdateDto: UserUpdateDto,
	) {
	  const userId = req.user.id;
	
	  const updateData: any = {
		username: userUpdateDto.username,
		bio: userUpdateDto.bio,
	  };
	
	  if (file) {
		updateData.avatar = `${file.filename}`;
	  }
	  await this.userService.updateUserDetails(userId, updateData);
	  return { message: 'Informations mises à jour avec succès', ...updateData };
	}
	
	@Get('avatars/:filename')
	seeUploadedFile(@Param('filename') filename): StreamableFile | NotFoundException {
		const path = join(process.cwd(), 'uploads', 'avatars', filename);
		if (!existsSync(path)) {
			throw new NotFoundException('Image not found.');
		}
		const file = createReadStream(path);
		return new StreamableFile(file);
	}
}