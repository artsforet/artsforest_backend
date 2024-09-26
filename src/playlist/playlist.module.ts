import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Playlist } from "./entities/playlist.entity";
import { PlaylistService } from "./playlist.service";
import { PlaylistController } from "./playlist.controller";
import { Music } from "src/music/entities/music.entity";
import { User } from "src/auth/entities/user.entity";
import { MusicService } from "src/music/music.service";
import { Likes } from "src/music/entities/likes.entity";
import { Curation } from "src/music/entities/curation.entity";
import { Pd } from "src/music/entities/pd.entity";
import { Download } from "src/music/entities/download.entity";
import { LastSong } from "src/music/entities/lastsong.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Playlist, Music, User, Likes, Curation, Pd, Download, LastSong])],
    controllers: [PlaylistController],
    providers: [PlaylistService, MusicService],
})
export class PlaylistModule {}