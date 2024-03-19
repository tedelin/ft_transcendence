import { Injectable } from "@nestjs/common";
import { CreateMatchDto } from "../dto/create-match.dto";
import { DatabaseService } from "src/database/database.service";
import { UpdateMatchDto } from "../dto/update-match.dto";

@Injectable()
export class GameService {
    constructor(private readonly databaseService: DatabaseService) { }

    async findAllGames(id_user?: number) {
        if (id_user) {
            return this.databaseService.match.findMany({
                where: {
                    players: {
                        some: {
                            playerId: id_user,
                        },
                    },
                },
                include: {
                    players: {
						include: {
							player:{
								select: {
									id: true,
									username: true,
									avatar: true,
								},
							}
						}
                    },
                },
            });
        }
        return this.databaseService.match.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                players: {
                    include: {
                        player:{
							select: {
								id: true,
								username: true,
								avatar: true,
							},
						}
                    }
                },
            },
        });
    }

    async createMatch(createMatchDto: CreateMatchDto) {
        const match = await this.databaseService.match.create({
            data: {
                status: createMatchDto.status,
                players: {
                    createMany: {
                        data: createMatchDto.players.map(player => ({
                            playerId: player.playerId,
                            score: player.score,
                            role: player.role,
                        })),
                    },
                },
            },
            include: {
                players: {
                    include: {
                        player:{
							select: {
								id: true,
								username: true,
								avatar: true,
							},
						}
                    }
                },
            },
        });
        return match;
    }

    async findOne(id_match: number) {
        return this.databaseService.match.findUnique({
            where: {
                id: id_match
            },
            include: {
                players: {
                    include: {
                        player:{
							select: {
								id: true,
								username: true,
								avatar: true,
							},
						}
                    }
                },
            },
        });
    }

    async updateMatch(id_match: number, updateMatchDto: UpdateMatchDto) {
        await this.databaseService.match.update({
            where: { id: id_match },
            data: { status: "FINISHED" },
        });

        const updatePromises = updateMatchDto.players.map(player => {
            return this.databaseService.matchUser.updateMany({
                where: {
                    matchId: id_match,
                    playerId: player.playerId,
                },
                data: {
                    score: player.score,
                    role: player.role,
                },
            });
        });
        await Promise.all(updatePromises);
        const match = await this.findOne(id_match);
        return match;
    }

    async findUserById(id: number) {
        const stats = await this.databaseService.stats.findUnique({
            where: {
                userId: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });
        return stats;
    }

    async createStats(id_user: number) {
        const User = await this.findUserById(id_user);
        if (User)
            return;
        const stats = await this.databaseService.stats.create({
            data:
            {
                userId: id_user,
                nbGames: 0,
                nbWin: 0,
                nbLoose: 0,
            },
        });

        return stats;
    }

    async createAchivement(id_user: number) {
        const User = await this.findUserById(id_user);
        if (User)
            return;
        const achivement = await this.databaseService.achievement.create({
            data:
            {
                userId: id_user,
                firstGame: false,
                firstWin: false,
                firstLoose: false,
                masterWinner: false,
                invincible_guardian: false,
                Speed_Demon: false,
            },
        });
        return achivement;
    }

    async updateStats(winner: any, looser: any) {
        await this.databaseService.stats.update({
            where: {
                id: winner.id,
            },
            data: {
                nbWin: winner.nbWin + 1,
                nbGames: winner.nbGames + 1,
            },
        });
        await this.databaseService.stats.update({
            where: {
                id: looser.id,
            },
            data: {
                nbLoose: looser.nbLoose + 1,
                nbGames: looser.nbGames + 1,
            },
        });
        const player1Stats = await this.findUserById(winner.userId);
        const player2Stats = await this.findUserById(looser.userId);
    }

    async getPlayersStats(winner: number, looser: number) {
        const player1Stats = await this.findUserById(winner);
        const player2Stats = await this.findUserById(looser);
        return { player1: player1Stats, player2: player2Stats };
    }

    async addMatchToStats(winner: number, looser: number) {
        const win = await this.findUserById(winner);
        const loose = await this.findUserById(looser);
        if (!win || !loose)
            return;
        await this.updateStats(win, loose);
    }

    async updateAchievement(winner: number, looser: number, score_O: boolean) {
        const win = await this.findUserById(winner);
        const loose = await this.findUserById(looser);
        if (!win || !loose)
            return;
        await this.databaseService.achievement.update({
            where: {
                userId: winner,
            },
            data: {
                firstWin: true,
                firstGame: true,
                masterWinner: win.nbWin >= 10 ? true : false,
                invincible_guardian: score_O ? true : false,
            },
        });
        await this.databaseService.achievement.update({
            where: {
                userId: looser,
            },
            data: {
                firstLoose: true,
                firstGame: true,
            },
        });
    }

    async updateSpeedDemon(user_one: number, user_two: number) {
        const userOne = await this.findUserById(user_one);
        const userTwo = await this.findUserById(user_two);
        if (!userOne || !userTwo)
            return;
        await this.databaseService.achievement.update({
            where: {
                userId: userOne.id,
            },
            data: {
                Speed_Demon: true,
            },
        });

        await this.databaseService.achievement.update({
            where: {
                userId: userTwo.id,
            },
            data: {
                Speed_Demon: true,
            },
        });
    }
}
