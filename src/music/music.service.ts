import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UploadMusicDto } from './dto/upload-music.dto';
import { User } from 'src/auth/entities/user.entity';
import { MulterFile } from 'src/common/common.types';
import { UploadMusicDataDto } from './dto/upload-music-data.dto';
import { deleteFileDisk, uploadFileDisk, uploadFileNaver, uploadImage } from 'src/fileFunction';
import { resolve } from 'path';
import { MusicDataDto } from './dto/music-data.dto';
import { In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as shell from 'shelljs';
import { readFileSync } from 'fs';
import { Music } from './entities/music.entity';
import { Likes } from './entities/likes.entity';
import { Download } from './entities/download.entity';
import { Curation } from './entities/curation.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Injectable()
export class MusicService {
    constructor(
        @InjectRepository(Music)
        private readonly musicRepository: Repository<Music>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Likes)
        private readonly likeRepository: Repository<Likes>,
        @InjectRepository(Curation)
        private readonly curationRepository: Repository<Curation>,
        @InjectRepository(Download)
        private readonly downloadRepository: Repository<Download>,
    ) {}

    async getAllMusic() {
        return await this.musicRepository.find();
    }

    async findAll(userId?: number): Promise<any[]> {
        const musicList = await this.musicRepository.find({ relations: ['likes'] });
        return musicList.map(music => ({
            ...music,
            isLiked: userId ? music.likes.some(like => like.user.id === userId) : false,
        }));
    }

    async findSoundFactorySong(userId?: number): Promise<any[]> {
        
        const musicList = await this.musicRepository.find({
            where: { category: '사운드팩토리_곡' },
            relations: ['likes', 'likes.user'],
        });

        return musicList.map(music => {
            const isLiked = userId ? music.likes.some(like => {
              console.log("Checking like: ", like, " for userId: ", userId);
              return like.user.id === userId;
            }) : false;
          
            return {
              ...music,
              isLiked,
            };
        });
    }

    async findSoundFactoryAlbum(): Promise<any> {
        try {
            const musicList = await this.musicRepository.find({ where: { category: '사운드팩토리_곡' } });

            const groupedByArtist = musicList.reduce((acc, music) => {
                if (!acc[music.artist]) acc[music.artist] = {};
                if (!acc[music.artist][music.album]) acc[music.artist][music.album] = [];
                acc[music.artist][music.album].push(music);
                return acc;
            }, {});

            return Object.entries(groupedByArtist).map(([artist, albums]) => ({
                artist,
                albums: Object.entries(albums).map(([album, tracks]) => ({ album, tracks })),
            }));
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error, 'Error occurred while fetching all albums by artists.');
        }
    }

    async findSfxEffect(userId?: number): Promise<any[]> {
        const musicList = await this.musicRepository.find({ where: { category: 'SFX_효과음' } });
        return musicList.map(music => ({
            ...music,
            isLiked: userId ? music.likes.some(like => like.user.id === userId) : false,
        }));
    }

    async findSfxPolySound(userId?: number): Promise<any[]> {
        const musicList = await this.musicRepository.find({ where: { category: 'SFX_폴리사운드' } });
        return musicList.map(music => ({
            ...music,
            isLiked: userId ? music.likes.some(like => like.user.id === userId) : false,
        }));
    }

    async findArtsForestSong(userId?: number): Promise<any[]> {
        const musicList = await this.musicRepository.find({ where: { category: '예술숲_곡' } });
        return musicList.map(music => ({
            ...music,
            isLiked: userId ? music.likes.some(like => like.user.id === userId) : false,
        }));
    }

    async findArtsForestAlbum(): Promise<any> {
        try {
            const musicList = await this.musicRepository.find({ where: { category: '예술숲_곡' } });

            const groupedByArtist = musicList.reduce((acc, music) => {
                if (!acc[music.artist]) acc[music.artist] = {};
                if (!acc[music.artist][music.album]) acc[music.artist][music.album] = [];
                acc[music.artist][music.album].push(music);
                return acc;
            }, {});

            return Object.entries(groupedByArtist).map(([artist, albums]) => ({
                artist,
                albums: Object.entries(albums).map(([album, tracks]) => ({ album, tracks })),
            }));
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error, 'Error occurred while fetching all albums by artists.');
        }
    }

    async findFreeSoundfactorySong(userId?: number): Promise<any[]> {
        const musicList = await this.musicRepository.find({ where: { category: '무료배포_사운드팩토리' } });
        return musicList.map(music => ({
            ...music,
            isLiked: userId ? music.likes.some(like => like.user.id === userId) : false,
        }));
    }

    async findSoundFactoryFreeYard(userId?: number): Promise<any[]> {
        const musicList = await this.musicRepository.find({ where: { category: '무료배포_공유마당' } });
        return musicList.map(music => ({
            ...music,
            isLiked: userId ? music.likes.some(like => like.user.id === userId) : false,
        }));
    }

    async findPlaylistQuration(): Promise<any> {
        try {
            const musicList = await this.musicRepository.find({ where: { category: '플레이리스트_큐레이션' } });

            const groupedByArtist = musicList.reduce((acc, music) => {
                if (!acc[music.artist]) acc[music.artist] = {};
                if (!acc[music.artist][music.album]) acc[music.artist][music.album] = [];
                acc[music.artist][music.album].push(music);
                return acc;
            }, {});

            return Object.entries(groupedByArtist).map(([artist, albums]) => ({
                artist,
                albums: Object.entries(albums).map(([album, tracks]) => ({ album, tracks })),
            }));
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error, 'Error occurred while fetching all albums by artists.');
        }
    }

    async findPlaylistLastSong(): Promise<any> {
        try {
            const musicList = await this.musicRepository.find({ where: { category: '플레이리스트_방금그곡' } });

            const groupedByArtist = musicList.reduce((acc, music) => {
                if (!acc[music.artist]) acc[music.artist] = {};
                if (!acc[music.artist][music.album]) acc[music.artist][music.album] = [];
                acc[music.artist][music.album].push(music);
                return acc;
            }, {});

            return Object.entries(groupedByArtist).map(([artist, albums]) => ({
                artist,
                albums: Object.entries(albums).map(([album, tracks]) => ({ album, tracks })),
            }));
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error, 'Error occurred while fetching all albums by artists.');
        }
    }

    async createMusic(createMusicData: MusicDataDto, user: User): Promise<Music> {
        const { permalink, tags, category } = createMusicData;

        const existMusics = await this.musicRepository.findOne({ where: { permalink, user: { id: user.id } } });

        const music = this.musicRepository.create({
            ...createMusicData,
            permalink: !existMusics ? permalink : `${permalink}_${Date.now()}`,
            user,
        });

        try {
            await this.musicRepository.save(music);
            return music;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error, 'Error occurred while creating music.');
        }
    }

    async getSongsOrderByPlayCount(): Promise<Music[]> {
        return await this.musicRepository.find({ order: { playCount: 'DESC' } });
    }

    async incrementPlayCount(id: number): Promise<Music> {
        const song = await this.musicRepository.findOne({ where: { id } });
        if (!song) {
            throw new NotFoundException('Song not found');
        }
        song.playCount += 1;
        return await this.musicRepository.save(song);
    }

    async likeSong(userId: number, musicId: number): Promise<void> {
      // Check if the user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
          throw new NotFoundException(`User not found for user ID ${userId}`);
      }
  
      // Check if the music exists
      const music = await this.musicRepository.findOne({ where: { id: musicId } });
      console.log("MUSIC" + music.id)
      if (!music) {
          throw new NotFoundException(`Music not found for music ID ${musicId}`);
      }
  
      // Create and save a new like entity
      const like = this.likeRepository.create({ user, music });
      await this.likeRepository.save(like);
  }

    async unlikeSong(userId: number, musicId: number): Promise<void> {
        const like = await this.likeRepository.findOne({
            where: { user: { id: userId }, music: { id: musicId } },
        });

        if (!like) {
            throw new NotFoundException(`Like not found for user ${userId} on music ${musicId}`);
        }

        await this.likeRepository.remove(like);
    }

    async uploadMusic(uploadMusicDto: UploadMusicDto, user: User) {
        const { music, cover, data } = uploadMusicDto;
        const fileBase = `${Date.now()}_${user.id}_`;

        const { buffer, originalname, mimetype } = this.changeMusicFileData(music, data, cover);

        let coverUrl: string | undefined;
        let coverFilename: string | undefined;
        if (cover) {
            const { filename: cFilename, link: cLink } = await uploadFileNaver(
                cover.buffer,
                cover.mimetype,
                fileBase + cover.originalname,
            );
            coverUrl = cLink;
            coverFilename = cFilename;
        }

        const { filename, link, permalink } = await uploadFileNaver(
            buffer,
            mimetype,
            fileBase + originalname,
        );

        const waveform = await this.generateWaveformData(music);

        const createMusicData = {
            ...data,
            filename,
            link,
            cover: coverUrl,
            coverFilename,
            permalink,
            waveform,
        };

        return this.createMusic(createMusicData, user);
    }

    changeMusicFileData(
        file: MulterFile,
        data: UploadMusicDataDto,
        image?: MulterFile,
    ) {
        const { description } = data;

        let tags: any = {
            title: data.title,
            category: data.category,
            artist: data.artist,
            // atmosphere: data.atmosphere,
            mood: data.mood,
            instrument: data.instrument,
            performerInfo: data.albumartist,
            year: data.year,
        };

        if (image) {
            tags = {
                ...tags,
                image: {
                    type: { id: 3, name: 'front cover' },
                    mime: image.mimetype,
                    description: 'album cover',
                    imageBuffer: image.buffer,
                },
            };
        }

        if (description) {
            tags = {
                ...tags,
                comment: {
                    language: 'kor',
                    text: description,
                },
            };
        }

        const NodeID3 = require('node-id3');
        const newBuffer = NodeID3.update(tags, file.buffer);

        return !newBuffer ? file : { ...file, buffer: newBuffer };
    }

    async generateWaveformData(file: MulterFile) {
        const tempFilePath = uploadFileDisk(file, `${Date.now()}${file.originalname.replace(/ /g, '')}`, 'temp');

        const jsonFilename = `${tempFilePath.split('.').slice(0, -1).join('.')}.json`;

        const command = `audiowaveform -i ${resolve(tempFilePath)} -o ${resolve(jsonFilename)} --pixels-per-second 20 --bits 8`;

        const child = shell.exec(command);
        let jsonData = null;
        if (child.code === 0) {
            jsonData = readFileSync(jsonFilename, 'utf8');
            deleteFileDisk(jsonFilename);
        }
        deleteFileDisk(tempFilePath);
        return jsonData;
    }

    async findAllMusic(): Promise<Music[]> {
        return this.musicRepository.find();
    }

    async findUserLikes(user: User): Promise<Likes[]> {
        return this.likeRepository.find({
            where: { user: { id: user.id } },
            relations: ['music'],
        });
    }

    async likeMusic(musicId: number, user: User) {
        const music = await this.musicRepository.findOne({ where: { id: musicId } });
        if (!music) {
            throw new NotFoundException('Music not found');
        }

        const existingLike = await this.likeRepository.findOne({ where: { user: { id: user.id }, music: { id: music.id } } });
        if (existingLike) {
            await this.likeRepository.remove(existingLike);
            return { liked: false };
        } else {
            const like = new Likes();
            like.user = user;
            like.music = music;
            await this.likeRepository.save(like);
            return { liked: true };
        }
    }

    async findAllWithLikes(user: User): Promise<any[]> {
        const musics = await this.musicRepository.find();
        if (!user) {
            return musics.map(music => ({
                ...music,
                liked: false,
            }));
        }

        const likes = await this.findUserLikes(user);
        const likedMusicIds = likes.map(like => like.music.id);

        return musics.map(music => ({
            ...music,
            liked: likedMusicIds.includes(music.id),
        }));
    }

    musicFindOne(id: number): Promise<Music> {
        return this.musicRepository.findOneBy({ id });
    }

    async downloadMusic(userId: number, musicId: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const music = await this.musicRepository.findOne({ where: { id: musicId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!music) {
            throw new NotFoundException('Music not found');
        }

        const download = this.downloadRepository.create({ user, music });
        await this.downloadRepository.save(download);

        music.downloadCount = (music.downloadCount || 0) + 1;
        await this.musicRepository.save(music);
    }

      
    async getArtistDownloads(artist: string): Promise<number> {
        const downloads = await this.downloadRepository
            .createQueryBuilder('download')
            .innerJoin('download.music', 'music')
            .where('music.artist = :artist', { artist })
            .getCount();

        return downloads;
    }

    async findSongsByAlbum(album: string, userId: number): Promise<any> {

        // Fetch songs and join with likes and user data
        const songs = await this.musicRepository
            .createQueryBuilder('music')
            .leftJoinAndSelect('music.likes', 'like')
            .leftJoin('like.user', 'user')
            .where('music.album = :album', { album })
            .select(['music', 'like', 'user'])
            .getMany();
        console.log(songs);
        // Map each song to include the isLiked flag based on user likes
        return songs.map(song => ({
            song,
            isLiked: song.likes.some(like => like.user && like.user.id === userId)
        }));
}

    async findAlbumsByArtist(artist: string): Promise<string[]> {
        const albums = await this.musicRepository
            .createQueryBuilder('music')
            .select('music.album')
            .where('music.artist = :artist', { artist })
            .distinct(true)
            .getRawMany();

        return albums.map(album => album.music_album);
    }

    async addLike(userId: number, musicId: number): Promise<Likes> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const music = await this.musicRepository.findOne({ where: { id: musicId } });
        if (!user || !music) {
            throw new NotFoundException('User or music not found');
        }

        const like = this.likeRepository.create({ user, music });
        return this.likeRepository.save(like);
    }


    async findCuration(): Promise<Curation[]> {
        return this.curationRepository.find({ relations: ['songs'] });
    }
    async findOne(id: number): Promise<Curation> {
        return this.curationRepository.findOne({ where: { id }, relations: ['songs'] });
    }

    async createCuration(name: string, songIds: number[], cover: string): Promise<Curation> {
        const songs = await this.musicRepository.findBy({
          id: In(songIds),
        });
    
        if (!songs.length) {
          throw new Error('No songs found with the provided IDs');
        }
    
        const newCuration = this.curationRepository.create({
          name,
          cover,
          songs,
        });
    
        return await this.curationRepository.save(newCuration);
      }
}
