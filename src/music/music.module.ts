import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MusicService } from "./music.service";
import { User } from "src/auth/entities/user.entity";
import { Playlist } from "src/playlist/entities/playlist.entity";
import { MusicController } from "./music.controller";
import { Music } from "./entities/music.entity";
import { Likes } from "./entities/likes.entity";
import { Download } from "./entities/download.entity";
import { Curation } from "./entities/curation.entity";
import { Pd } from "./entities/pd.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Music,
            User,
            Playlist,
            Likes,
            Download,
            Curation,
            Pd
        ]),
    ],
    controllers: [MusicController],
    providers: [MusicService],
})
export class MusicModule {}

