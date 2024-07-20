import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadMusicDto } from './dto/upload-music.dto';
import { User } from 'src/auth/entities/user.entity';
import { MulterFile } from 'src/common/common.types';
import { UploadMusicDataDto } from './dto/upload-music-data.dto';
import { deleteFileDisk, uploadFileDisk, uploadFileNaver } from 'src/fileFunction';
import { resolve } from 'path';
import { MusicDataDto } from './dto/music-data.dto';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as shell from 'shelljs';
import { readFileSync } from 'fs';
import { Music } from './entities/music.entity';
import { Likes } from './entities/likes.entity';

@Injectable()
export class MusicService {
    constructor(
        @InjectRepository(Music)
        private readonly musicRepository: Repository<Music>,
        @InjectRepository(User)
        private readonly authRepository: Repository<User>,
        @InjectRepository(Likes)
        private readonly likeRepository: Repository<Likes>,
      ){}

    async getAllMusic() {
        return await this.musicRepository.find();
    }

    async findAll(userId?: number): Promise<any[]> {
      const musicList = await this.musicRepository.find({ relations: ['likes'] });
      return musicList.map(music => {
        const isLiked = userId ? music.likes.some(like => like.user.id === userId && like.user) : false;
        return { ...music, isLiked };
      });
    }

 
    async findSoundFactorySong(userId?: number): Promise<any[]>{
      const musicList = await this.musicRepository.find({where: {category: '사운드팩토리_곡'}})
       return musicList.map(music => {
        const isLIked = userId ? music.likes.some(like => like.user.id === userId && like.user) : false;
        return { ...music, isLIked }
       })
    }
    // getMusicById(id: string): Music {
    //     return this.musicList.find((music) => music.id === id);
    // }
    async createMusic(createMusicData: MusicDataDto, user: User): Promise<Music> {
      const { permalink, tags, category } = createMusicData;

      // `where` 조건에서 `user` 객체를 올바르게 참조하도록 수정합니다.
      const existMusics = await this.musicRepository.findOne({ where: { permalink, user: { id: user.id } } });

      const music = this.musicRepository.create({
        ...createMusicData,
        permalink: !existMusics ? permalink : `${permalink}_${Date.now()}`,
        // tagsLower: tags ? tags.map((t) => t.toLowerCase()) : tags,
        user,
      });

      try {
        await this.musicRepository.save(music);
        return music;
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          error,
          `Error occurred while creating music.`,
        );
      }
    }

    async findAlbumsByArtist(): Promise<any> {
      try {
        const musicList = await this.musicRepository.find();
        const groupedByArtist = musicList.reduce((acc, music) => {
          if (!acc[music.artist]) {
            acc[music.artist] = {};
          }
          if (!acc[music.artist][music.album]) {
            acc[music.artist][music.album] = [];
          }
          acc[music.artist][music.album].push(music);
          return acc;
        }, {});
  
        return Object.entries(groupedByArtist).map(([artist, albums]) => ({
          artist,
          albums: Object.entries(albums).map(([album, tracks]) => ({ album, tracks }))
        }));
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(error, `Error occurred while fetching all albums by artists.`);
      }
    }

    async uploadMusic(uploadMusicDto: UploadMusicDto, user: User) {
        const { music, cover, data } = uploadMusicDto;
        const fileBase = `${Date.now()}_${user.id}_`;
    
        // 유저가 작성한 음악정보로 파일을 수정
        const { buffer, originalname, mimetype } = this.changeMusicFileData(
          music,
          data,
          cover,
        );
        console.log(buffer, originalname, mimetype)
        
        // 음악파일 및 음악 커버 이미지를 파이어베이스에 저장
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
        console.log("WF" + waveform);
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
          atomsphare: data.atomsphare,
          mood: data.mood, 
          instrument: data.instrument,
          //   album: data.album,
          performerInfo: data.albumartist,
        //   composer: data.composer,
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
    
        // if (lyrics) {
        //   tags = {
        //     ...tags,
        //     unsynchronisedLyrics: {
        //       language: 'kor',
        //       text: lyrics,
        //     },
        //   };
        // }
    
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
        // 음악의 파형을 분석하고 데이터를 반환
    
        // Save music file temporarily
        const tempFilePath = uploadFileDisk(
          file,
          `${Date.now()}${file.originalname.replace(/ /g, '')}`,
          'temp',
        );
        console.log("FILE" + file);
        // File name to save waveform data
        const jsonFilename = `${tempFilePath
          .split('.')
          .slice(0, -1)
          .join('.')}.json`;
    
        // Audiowaveform Command
        const command = await `audiowaveform -i ${resolve(
          tempFilePath,
        )} -o ${resolve(jsonFilename)} --pixels-per-second 20 --bits 8`;
        // Execute command
        const child = shell.exec(command);
        let jsonData = null;
        if (child.code === 0) {
          // If success, read json file
          jsonData = readFileSync(jsonFilename, 'utf8');
          deleteFileDisk(jsonFilename); // Delete temporarily saved json files
        }
        deleteFileDisk(tempFilePath); // Delete temporarily saved music files
        return jsonData;
      }
    
      findAllMusic(): Promise<Music[]> {
        return this.musicRepository.find();
      }
    
      // USER LIKE 

      async findUserLikes(user: User): Promise<Likes[]> {
        return this.likeRepository.find({
          where: { user: { id: user.id }},
          relations: ['music'],
        });
      }
    
      async likeMusic(musicId: number, user: User) {
        const music = await this.musicRepository.findOne({ where: { id: musicId } });
        if (!music) {
          throw new Error('Music not found');
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

      // MUSIC

      musicFindOne(id: number): Promise<Music> {
        return this.musicRepository.findOneBy({ id });
      }

      // LIKE
      likeFindAll(): Promise<Likes[]> {
        return this.likeRepository.find({ relations: ['user', 'music'] });
      }
    
      likeFindOne(id: number): Promise<Likes> {
        return this.likeRepository.findOneBy({ id });
      }
    
      likeFindOneByUserAndMusic(userId: number, musicId: number): Promise<Likes> {
        return this.likeRepository.findOne({ where: { user: { id: userId }, music: { id: musicId } } });
      }
    
      async likeCreate(like: Likes): Promise<Likes> {
        const existingLike = await this.likeFindOneByUserAndMusic(like.user.id, like.music.id);
        if (existingLike) {
          throw new ConflictException('You have already liked this music');
        }
        return this.likeRepository.save(like);
      }
    
      async likeRemove(id: number): Promise<void> {
        await this.likeRepository.delete(id);
      }

      // async addLike(userId: number, musicId: number): Promise<Likes> {
      //   const user = await this.authRepository.findOne({where: {id: userId}});
      //   const music = await this.musicRepository.findOne({where: {id: musicId}});
      //   const like = this.likeRepository.create({ user, music });
      //   return this.likeRepository.save(like);
      // }
    
      // // async removeLike(likeRepository: number, musicId: number): Promise<void> {
      // //   await this.likeRepository.delete({ user: { id: userId }, music: { id: musicId } });
      // // }
    
      // async test(userId?: number): Promise<any[]> {
      //   const musicList = await this.musicRepository.find({ relations: ['likes'] });
      //   return musicList.map(music => {
      //     const isLiked = userId ? music.likes.some(like => like.user.id === userId && like.isLiked) : false;
      //     return { ...music, isLiked };
      //   });
      // }
    
      // async toggleLike(userId: number, musicId: number): Promise<Likes> {
      //   let like = await this.likeRepository.findOne({ where: { user: { id: userId }, music: { id: musicId } } });
    
      //   if (like) {
      //     like.isLiked = !like.isLiked;
      //   } else {
      //     like = this.likeRepository.create({ user: { id: userId }, music: { id: musicId }, isLiked: true });
      //   }
    
      //   return this.likeRepository.save(like);
      // }
      

      // findUserLikes(user: User): Promise<Likes[]> {
      //   return this.likeRepository.find({ where: { user }, relations: ['music'] });
      // }
    
      // findMusic(): Promise<Music[]> {
      //   return this.musicRepository.find();
      // }

      // async likeMusic(musicId: number, user: User) {
      //   const music = await this.musicRepository.findOne({ where: { id: musicId } });
      //   if (!music) {
      //     throw new Error('Music not found');
      //   }
    
      //   const existingLike = await this.likeRepository.findOne({ where: { user: { id: user.id }, music: { id: music.id } } });
      //   if (existingLike) {
      //     await this.likeRepository.remove(existingLike);
      //     return { liked: false };
      //   } else {
      //     const like = new Likes();
      //     like.user = user;
      //     like.music = music;
      //     await this.likeRepository.save(like);
      //     return { liked: true };
      //   }
      // }
    
      
      // async findAllWithLikes(user: User): Promise<Music[]> {
      //   if (!user) {
      //     return this.findAll();
      //   }
        
      //   const query = this.musicRepository.createQueryBuilder('music')
      //     .leftJoinAndSelect('music.likes', 'like', 'like.userId = :userId', { userId: user.id })
      //     .select(['music.id', 'music.title', 'music.artist', 'music.fileUrl'])
      //     .addSelect('CASE WHEN like.id IS NOT NULL THEN true ELSE false END', 'liked');
    
      //   return query.getRawMany();
      // }

      
    // updateMusic(id: string, updatedMusic: Music): void {
    //     const index = this.musicList.findIndex((music) => music.id === id);
    //     if (index !== -1) {
    //         this.musicList[index] = updatedMusic;
    //     }
    // }

    // deleteMusic(id: string): void {
    //     this.musicList = this.musicList.filter((music) => music.id !== id);
    // }
    // async findAllWithLikes(userId: number): Promise<any> {
    //   const musicList = await this.musicRepository.find();
    //   const likes = await this.likeRepository.find({ where: { user: { id: userId } } });
  
    //   const likedMusicIds = likes.map(like => like.music.id);
  
    //   return musicList.map(music => ({
    //     ...music,
    //     liked: likedMusicIds.includes(music.id),
    //   }));
    // }
  
    // async likeMusic(userId: number, musicId: number): Promise<void> {
    //   const user = await this.authRepository.findOne({ where: { id: userId } });
    //   const music = await this.musicRepository.findOne({ where: { id: musicId } });
  
    //   if (user && music) {
    //     const like = new Like();
    //     like.user = user;
    //     like.music = music;
    //     await this.likeRepository.save(like);
    //   }
    // }
  
    // async unlikeMusic(userId: number, musicId: number): Promise<void> {
    //   await this.likeRepository.delete({ user: { id: userId }, music: { id: musicId } });
    // }
  
    // async isMusicLiked(userId: number, musicId: number): Promise<boolean> {
    //   const like = await this.likeRepository.findOne({ where: { user: { id: userId }, music: { id: musicId } } });
    //   return !!like;
    // }
  }