import { Module } from "@nestjs/common";
import { GameGateway } from "./controllers/game.gateway";
import { GameController } from "./controllers/game.controller";
import { RoomService } from "./services/room.service";
import { PongService } from "./services/pong.service";
import { GameService } from "./services/game.service";
import { DatabaseModule } from "src/database/database.module";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [DatabaseModule, AuthModule, UserModule],
    controllers: [GameController],
    providers: [GameGateway, RoomService, PongService, GameService]
})

export class GameModule {}