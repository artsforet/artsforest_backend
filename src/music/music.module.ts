import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MusicService } from "./music.service";
import { User } from "src/auth/entities/user.entity";
import { Playlist } from "src/playlist/entities/playlist.entity";
import { MusicController } from "./music.controller";
import { Music } from "./entities/music.entity";
import { Likes } from "./entities/likes.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Music,
            User,
            Playlist,
            Likes
        ]),
    ],
    controllers: [MusicController],
    providers: [MusicService],
})
export class MusicModule {}

