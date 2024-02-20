import { Injectable } from "@nestjs/common";
import { CreateMatchDto } from "../dto/create-match.dto";
import { DatabaseService } from "src/database/database.service";
import { UpdateMatchDto } from "../dto/update-match.dto";

@Injectable()
export class GameService {
    constructor (private readonly databaseService : DatabaseService) {}

    // async getStats(id_user : number) {
    //     const stats = this.databaseService.stats.findUnique({
    //         where: {
    //             userId: id_user,
    //         }
    //     });
    //     if (!stats) throw new NotFoundException(`Stats of user ${id_user} not found`);
    //     return stats;
    // }

    // async createStats(createStatsDto: Prisma.StatsCreateInput) {
    //     const createdStats = await this.databaseService.stats.create({
    //         data: createStatsDto,
    //     });
    //     return createdStats;
    // }

    // async updateStats(id_user : number, updateStatsDto : Prisma.StatsUpdateInput) {
    //     const updatedStats = await this.databaseService.stats.update({
    //         where: {
    //             userId: id_user,
    //         },
    //         data: updateStatsDto,
    //     })
    //     return updatedStats;
    // }

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
                            player: true, // Assurez-vous que les détails du joueur sont inclus
                        }
                    },
                },
            });
          }
        return this.databaseService.match.findMany({
            orderBy: {
                createdAt: 'asc', // Trier par date de création dans un ordre décroissant
            },
            include: {
                players: {
                    include: {
                        player: true,
                    }
                },
            },
        });
    }

    async createMatch(createMatchDto: CreateMatchDto) {
        const match = await this.databaseService.match.create({
            data: {
                status : "IN_GAME",
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
                        player: true,
                    }
                },
            },
        });
        return match;
    }

    async findOne(id_match : number) {
        return this.databaseService.match.findUnique({
            where: { 
                id: id_match 
            },
            include: {
                players: {
                    include: {
                        player: true,
                    },
                },
            },
        });
    }

    async updateMatch(id_match : number, updateMatchDto : UpdateMatchDto) {
        await this.databaseService.match.update({
            where: { id: id_match },
            data: { status: "FINISHED" },
        });
    
        // Ensuite, mettez à jour les détails de chaque joueur associé au match
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
        return this.findOne(id_match);
    }

    async findUserById(id: number) {
        const stats = await this.databaseService.stats.findUnique({
            where: {
                userId : id,
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
        // console.log(`createStats ${id_user}`);
        const User = await this.findUserById(id_user);
        // console.log(User);
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

    async updateStats(winner: any, looser: any) {
        console.log(`before update winner : ${winner}`);
        console.log(`before update winner : ${looser}`);
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
        console.log("AFTER :::::: ")
        console.log(player1Stats);
        console.log("-----------------")
        console.log(player2Stats);
    }

    async getPlayersStats(winner: number, looser: number) {
        console.log(`winner id = ${winner}`);
        console.log(`looser id = ${looser}`);
        const player1Stats = await this.findUserById(winner);
        const player2Stats = await this.findUserById(looser);
        console.log("SENDING :::::: ")
        console.log(player1Stats);
        console.log("-----------------")
        console.log(player2Stats);
        return { player1: player1Stats, player2: player2Stats };
    }

    async addMatchToStats(winner: number, looser: number) {
        const win_stats = await this.findUserById(winner);
        const loose_stats = await this.findUserById(looser);
        if (!win_stats || !loose_stats)
            return;
        await this.updateStats(win_stats, loose_stats);
    }
}
