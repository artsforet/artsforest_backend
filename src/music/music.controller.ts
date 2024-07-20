import { Controller, Delete, Get, Param, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MusicService } from './music.service'; // Import the MusicService class
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadedFilesPipe } from './pipes/uploaded-files.pipe';
import { UploadMusicDto } from './dto/upload-music.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { Request } from 'express';
import { GetOrUser } from 'src/decorators/get-or-user-decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/jwt-auth-guart-optional';
import { AuthGuard } from '@nestjs/passport';
import { Music } from './entities/music.entity';
import { Likes } from './entities/likes.entity';
import { MulterFile } from 'src/common/common.types';


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
  
    @Get('/soundfactory/song')
    async find(){
      return this.musicService.findSoundFactorySong()
    }
    

    @Get('/soundfactory/album')
    async findSoundFactoryAlubm(){
      return this.musicService.findAlbumsByArtist()
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
      return this.musicService.musicFindOne(id);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/like')
    async likeMusic(@Param('id') musicId: number, @GetOrUser() user) {
      user.id = user.id;
  
      const music = new Music();
      music.id = musicId;
  
      const like = new Likes();
      like.user = user;
      like.music = music;
  
      return this.musicService.likeCreate(like);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/like')
    async unlikeMusic(@Param('id') musicId: number, @GetOrUser() user) {
      const userId = user.id
      const like = await this.musicService.likeFindOneByUserAndMusic(userId, musicId);
      if (like) {
        return this.musicService.likeRemove(like.id);
      }
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get(':id/liked')
    async isLikedByUser(@Param('id') musicId: number, @GetOrUser() user) {
      const userId = user.id
      const like = await this.musicService.likeFindOneByUserAndMusic(userId, musicId);
      return { liked: !!like };
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
}