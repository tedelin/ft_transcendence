import { Injectable } from "@nestjs/common";
import { CreateStatsDto } from '../dto/create-stats.dto';
import { UpdateStatsDto } from '../dto/update-stats.dto';
import { CreateMatchDto } from "../dto/create-match.dto";
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from "src/database/database.service";
import { UserService } from "src/user/user.service";

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
                createdAt: 'desc', // Trier par date de création dans un ordre décroissant
            },
            take: 10,
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
                players: true, // Inclure les détails des joueurs associés au match
            },
        });
        return match;
    }

}
