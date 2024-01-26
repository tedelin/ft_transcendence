import { Module } from "@nestjs/common";
import { GameGateway } from "./controllers/game.gateway";
import { GameController } from "./controllers/game.controller";
import { RoomService } from "./services/room.service";
import { PongService } from "./services/pong.service";
import { GameService } from "./services/game.service";

@Module({
    controllers: [GameController],
    providers: [GameGateway, RoomService, PongService, GameService]
})

export class GameModule {}