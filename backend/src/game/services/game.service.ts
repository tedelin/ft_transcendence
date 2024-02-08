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
}
