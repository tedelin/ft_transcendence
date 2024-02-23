import { Controller, Get, Param, ParseIntPipe, Req, UseGuards, Post, UploadedFile, UseInterceptors, Res, NotFoundException, StreamableFile} from '@nestjs/common';
import { Request} from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import { extname, join} from 'path'
import { createReadStream, existsSync } from 'fs';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Get('all') 
    findAll() {
        return this.userService.findAll();
    }

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        return req.user;
    }
	
	@Get('username/:username')
	getUserByName(@Param('username') username: string) {
		return this.userService.getUserByUsername(username);
	}

	@Get('id/:id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.userService.getUserById(id)
	}

    @Get(':id/channels')
    findUserChannels(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserChannels(id)
    }

	@Post('upload-avatar')
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
			return cb(new Error('Seuls les fichiers images sont autorisés !'), false);
		  }
		  cb(null, true);
		},
	  })) // gerer l'erreur grace a un filtre, determiner comment ecrire le filtre correctement avec la syntaxe de nestJS 
	@UseGuards(JwtGuard)
	async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
	  const userId = req.user.id;
	  const avatarUrl = `${file.filename}`;
  
	  await this.userService.saveAvatarPath(avatarUrl, userId);
  
	  return { message: 'Avatar mis à jour avec succès', avatarUrl };
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
