import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Playlist } from "./entities/playlist.entity";
import { PlaylistService } from "./playlist.service";
import { PlaylistController } from "./playlist.controller";
import { Music } from "src/music/entities/music.entity";
import { User } from "src/auth/entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Playlist, Music, User])],
    controllers: [PlaylistController],
    providers: [PlaylistService],
})
export class PlaylistModule {}