import { DatabaseService } from "src/database/database.service";
import { Injectable } from "@nestjs/common";

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
	
}