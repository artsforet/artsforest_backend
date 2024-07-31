import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Req, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MusicService } from './music.service'; // Import the MusicService class
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UploadedFilesPipe } from './pipes/uploaded-files.pipe';
import { UploadMusicDto } from './dto/upload-music.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { request } from 'express';
import { GetOrUser } from 'src/decorators/get-or-user.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/jwt-auth-guart-optional';
import { AuthGuard } from '@nestjs/passport';
import { Music } from './entities/music.entity';
import { Likes } from './entities/likes.entity';
import { MulterFile } from 'src/common/common.types';
import { Curation } from './entities/curation.entity';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { uploadImage } from 'src/fileFunction';


@Controller('/music')
export class MusicController {
    private musicService: MusicService; // Declare a private property to hold the instance of MusicService

    constructor(musicService: MusicService) {
        this.musicService = musicService; // Inject the MusicService instance through the constructor
      }


    
    
    // @Get('/')
    // getAllMusic() {
    //     return this.musicService.getAllMusic(); 
    // }

    // @Get('/:id')
    // getMusicById(id: string) {
    //     // Logic to get music by ID
    // }


    @Post('/upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'musics', maxCount: 10 },
        { name: 'cover', maxCount: 1 },
        { name: 'datas', maxCount: 10 },
      ]),
    )
    async uploadMusic(
      @UploadedFiles(UploadedFilesPipe) uploadMusicDto: { musics: MulterFile[], cover?: MulterFile, data: any[] },
      @GetUser() user: User,
    ) {
      const results = await Promise.all(
        uploadMusicDto.musics.map((music, index) => {
          const data = uploadMusicDto.data[index];
          const cover = uploadMusicDto.cover;
          return this.musicService.uploadMusic({ music, cover, data }, user);
        })
      );
      return results;
    }
    

    @Get('popular')
    async getPopularSongs(): Promise<Music[]> {
      return this.musicService.getSongsOrderByPlayCount();
    }

    @Patch(':id/play')
    async incrementPlayCount(@Param('id') id: number): Promise<Music> {
      return this.musicService.incrementPlayCount(id);
    }

    // @Post('/upload')
    // @UseGuards(JwtAuthGuard)
    // @UseInterceptors(
    //   FileFieldsInterceptor([
    //     { name: 'musics', maxCount: 20 },
    //     { name: 'cover', maxCount: 1 },
    //     { name: 'datas', maxCount: 1 },
    //   ]),
    // )
    // async uploadMusic(
    //   @UploadedFiles(UploadedFilesPipe) uploadMusicDto: UploadMusicDto,
    //   @GetUser() user: User,
    // ) {
    //   return this.musicService.uploadMusic(uploadMusicDto, user);
    // }


    // @Get('/test')
    // async findAll(@GetUser() user: User) { 
    //   const userId = user?.id; // 사용자 ID가 없을 수 있음
    //   return this.musicService.test(userId);
    // }
    @Get('/')
    findAll() { 
      return this.musicService.findAll();
    }

    // @UseGuards(AuthGuard('jwt'))
    @Get('/soundfactory/song')
    async find(
      @GetOrUser() user: User,
    ) {
      const userId = user ? user.id : null;
      console.log("USERID" + userId);
      return this.musicService.findSoundFactorySong(userId)
    }
    

    @Get('/soundfactory/album')
    async findSoundFactoryAlubm(){
      return this.musicService.findSoundFactoryAlbum ()
    }

 
    @Get('/soundfactory/sfxEffect')
    async findsfxSong(){
      return this.musicService.findSfxEffect()
    }

    @Get('/soundfactory/sfxPolysound')
    async findsArtsForestSong(){
      return this.musicService.findSfxPolySound()
    }

    
    @Get('/soundfactory/artsForestSong')
    async findArtsForestSong(){
      return this.musicService.findArtsForestSong()
    }


    
    @Get('/soundfactory/artsForestAlbum')
    async findsArtsForestAlbum(){
      return this.musicService.findArtsForestAlbum()
    }

    

    @Get('/soundfactory/freeSoundFacotry')
    async findFreesoundFactorySong(){
      return this.musicService.findFreeSoundfactorySong()
    }

 

    @Get('/soundfactory/FreeYard')
    async findFreeYard(){
      return this.musicService.findSoundFactoryFreeYard()
    }


    @Get('/soundfactory/playlistQuration')
    async findPlaylistQuration(){
      return this.musicService.findPlaylistQuration()
    }


    @Get('/soundfactory/playlistLastSong')
    async findPlaylistLastSong(){
      return this.musicService.findPlaylistLastSong()
    }


    @Get(':id')
    findOne(@Param('id') id: number) {
      return this.musicService.musicFindOne(id);
    }


// LIKE 
  


@UseGuards(AuthGuard('jwt'))
@Post('like/:musicId')
async likeSong(@Param('musicId') musicId: number, @Req() req: any): Promise<void> {
  const userId = req.user.id || null;
  console.log("userID" + userId)
  await this.musicService.likeSong(userId, musicId);
}

@UseGuards(AuthGuard('jwt'))
@Delete('unlike/:musicId')
async unlikeSong(@Param('musicId') musicId: number, @Req() req: any): Promise<void> {
  const userId = req.user.id || null;
  await this.musicService.unlikeSong(userId, musicId);
}



    // @Patch(':id/like')
    // async toggleLikeStatus(@Param('id') musicId: number, @GetOrUser() user): Promise<Music> {
    //   const userId = user.id;
    //   const like = await this.musicService.likeFindOneByUserAndMusic(userId, musicId);
    //   if(!like){
    //     return this.musicService.likeremove(like.id );
    //   }
    //   return this.musicService.toggleLikeStatus(musicId);
    // }

    
    // @UseGuards(AuthGuard('jwt'))
    // @Post('/liked/:id')
    // async likeMusic(@Param('id') musicId: number, @GetOrUser() user:  User) {
    //   user.id = user.id;
  
    //   const music = new Music();
    //   music.id = musicId;
  
    //   const like = new Likes();
    //   like.user = user;
    //   like.music = music;
  
    //   return this.musicService.likeCreate(like);
    // }
  
    // @UseGuards(AuthGuard('jwt'))
    // @Delete('/liked/:id')
    // async unlikeMusic(@Param('id') musicId: number, @GetOrUser() user: User) {
    //   const userId = user.id
    //   const like = await this.musicService.likeFindOneByUserAndMusic(userId, musicId);
    //   if (like) {
    //     return this.musicService.likeRemove(like.id);
    //   }
    // }
  
    // @UseGuards(AuthGuard('jwt'))
    // @Get('/liked/:id')
    // async isLikedByUser(@Param('id') musicId: number, @GetOrUser() user: User) {
    //   const userId = user.id
    //   const like = await this.musicService.likeFindOneByUserAndMusic(userId, musicId);
    //   return { liked: !!like };
    // }

    // DOWNLOAD 

    @Post('/download/:musicId')
    async downloadMusic(
      @Param('musicId', ParseIntPipe) musicId: number,
      @Request() req: any,
    ): Promise<void> {
      const userId = req.user;
      await this.musicService.downloadMusic(userId, musicId);
    }
  
    @Get('/artist/:artist')
    async getArtistDownloads(@Param('artist') artist: string): Promise<number> {
      return this.musicService.getArtistDownloads(artist);
    }

    
    @UseGuards(AuthGuard('jwt'))
    @Get('/album/:album')
    async getSongsByAlbum(
      @Param('album') album: string, 
      @Request() req: any
  ): Promise<Music[]> {
      const userId = req.user.id || null;
      console.log("ID" + userId);
      return this.musicService.findSongsByAlbum(album, userId);
    }
  
    @Get('artist/:artist/albums')
    async getAlbumsByArtist(@Param('artist') artist: string): Promise<string[]> {
      return this.musicService.findAlbumsByArtist(artist);
    }

    // @UseInterceptors(
        // FileFieldsInterceptor([
          // { name: 'cover', maxCount: 1 },
      // ])   
    // )
 

    @Get('/curation/all')
    async findCuration(): Promise<any> {
      const curationData = await this.musicService.findCuration();
      
      // Grouping curations by name
      const groupedCurations = curationData.reduce((acc, curation) => {
        if (!acc[curation.name]) {
          acc[curation.name] = { ...curation, songs: [] };
        }
        acc[curation.name].songs.push(...curation.songs);
        return acc;
      }, {});
    
      // Convert object back to array
      return Object.values(groupedCurations);
    }


    @Post('/curation/create')
    @UseInterceptors(FileInterceptor('cover'))
    async create(
      @Body() createAlbumDto: { name: string; songIds: any },
      @UploadedFile() cover: Express.Multer.File,
    ): Promise<Curation> {
      try {
        const { name, songIds } = createAlbumDto;
  
        if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
          throw new Error('No song IDs provided or invalid format');
        }
  
        let coverUrl = '';
        if (cover) {
          coverUrl = await uploadImage(cover);
        } else {
          throw new Error('Cover image is required');
        }
  
        return await this.musicService.createCuration(name, songIds, coverUrl);
  
      } catch (error) {
        console.error('Error creating curation:', error);
        throw new Error('Failed to create curation: ' + error.message);
      }
    }
    }
    // @UseGuards(JwtAuthGuard)
    // @Post(':musicId/like')
    // async toggleLike(@Param('musicId') musicId: number, @Req() request: Request) {
    //   const userId = request.user.id; // Assuming user ID is available in the request object
    //   return this.musicService.toggleLike(userId, musicId);
    // }

    //////////////////////////////////


    // @Put('/:id')
    // updateMusic(id: string) {
    //     // Logic to update music by ID
    // }
    // @Post(':userId/:musicId')
    // async likeMusic(@Param('userId') userId: number, @Param('musicId') musicId: number) {
    //   await this.musicService.likeMusic(userId, musicId);
    // }
  
    // @Delete(':userId/:musicId')
    // async unlikeMusic(@Param('userId') userId: number, @Param('musicId') musicId: number) {
    //   await this.musicService.unlikeMusic(userId, musicId);
    // }
  
    // @Get(':userId/:musicId')
    // async isMusicLiked(@Param('userId') userId: number, @Param('musicId') musicId: number): Promise<{ liked: boolean }> {
    //   const liked = await this.musicService.isMusicLiked(userId, musicId);
    //   return { liked };
    // }
    // @Delete('/:id')
    // deleteMusic(id: string) {
        // Logic to delete music by ID
// }