import { DatabaseService } from "src/database/database.service";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UserService {
	constructor(private readonly databaseService: DatabaseService) {}

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
				channels: true,
			},
		});
	}

	async getUserByUsername(username: string) {
		const user = await this.databaseService.user.findUnique({
			where: {
				username,
			},
		});
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
	}
	
}