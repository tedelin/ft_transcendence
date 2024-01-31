import { Injectable } from "@nestjs/common";
import { CreateStatsDto } from '../dto/create-stats.dto';
import { UpdateStatsDto } from '../dto/update-stats.dto';
import { CreateHistoryDto } from "../dto/create-history.dto";
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class GameService {
    constructor(private readonly databaseService : DatabaseService) {}

    private stats = [
        {
            id: 1,
            user_id: "ale-sain",
            played: 10,
            win: 2
        },
    ]

    private history = [
        {
            id: 1,
            date: "29/01/24",
            P1_id: "ale-sain",
            P2_id: "mcatal-d",
            P1_score: 0,
            P2_score: 1,
        }
    ]

    async getStats(id_user : string) {
        const stats = this.databaseService.stats.findUnique(stats => stats.user_id === id_user);
        if (!stats) throw new NotFoundException(`Stats of user ${id_user} not found`);
        return stats;
    }

    async createStats(createStatsDto: Prisma.StatsCreateInput) {
        const user = this.databaseService.user.findUnique {
            where:
        }
        const statsSorted = this.stats.sort((a, b) => b.id - a.id);
        const newStats = {
            id: statsSorted[0].id + 1,
            ...createStatsDto
        }
        this.stats.push(newStats);
        return newStats;
    }

    async updateStats(id_user : string, updateStatsDto : Prisma.StatsUpdateInput) {
        this.stats = this.stats.map(stat => {
            if (stat.user_id === id_user)
                return ({...stat, ...updateStatsDto});
            return stat;
        })
        return this.getStats(id_user);
    }

    async findAllGames(id_user?: string) {
        if (id_user) {
            const match = this.history.filter(match => match.P1_id === id_user || match.P2_id === id_user);
            if (match.length === 0) throw new NotFoundException('Match from this user not found');
            return match;
        }
        return this.history;
    }

    async createGame(createHistoryDto: Prisma.MatchCreateInput) {
        const history = this.history.sort((a, b) => b.id - a.id);
        const newMatch = {
            id: history[0].id + 1,
            ...createHistoryDto
        }
        this.history.push(newMatch);
        return newMatch;
    }
}