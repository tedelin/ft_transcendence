import { DatabaseService } from 'src/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(private readonly databaseService: DatabaseService) {}

async getProfilData(id: number) {
  return await this.databaseService.user.findUnique({
    where: {
      id,
    },
    select: {
      username: true,
      avatar: true,
      stats: true,
      Achievement: true,
    },
  });
}
	  

	async findAll() {
		return await this.databaseService.user.findMany({
			select: {
				id: true,
				username: true,
				avatar: true,
				status: true,
			},
		});
	}

	async searchUser(query: string) {
		return await this.databaseService.user.findMany({
			take: 10,
			where: query 
				? {
					username: {
						contains: query,
					},
				} 
				: {},
			select: {
				id: true,
				username: true,
				avatar: true,
				status: true,
			},
		});
	}

    async getUserById(id: number) {
        return await this.databaseService.user.findUnique({
            where: {
                id,
            },
        });
    }

	async getUserChannels(id: number) {
		return await this.databaseService.user.findUnique({
			where: {
				id,
			},
			select: {
				channels: {
					where: {
						role: {
							not: 'BANNED',
						},
					},
				},
			},
		});
	}

	async getUserByUsername(username: string) {
		const user = await this.databaseService.user.findUnique({
			where: {
				username,
			},
		});
        if (!user) throw new NotFoundException('User not found');
        return user;
	}

	async saveAvatarPath(avatar: string, userId : number){
		await this.databaseService.user.update({
			where: { id: userId },
			data: { avatar },
	  });
	}

	async updateUserState(userId: number, status: UserStatus) {
		return await this.databaseService.user.update({
			where: { id: userId },
			data: { status },
		});
	}
}
