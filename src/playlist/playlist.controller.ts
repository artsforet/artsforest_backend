import { Controller, Post, Get, Body, Req, Param, UseGuards, ParseIntPipe, Put, Delete, Request, BadRequestException, HttpStatus, HttpException, NotFoundException } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetOrUser } from 'src/decorators/get-or-user.decorator';
import { Music } from 'src/music/entities/music.entity';
import { MusicService } from 'src/music/music.service';

@Controller('playlist')
export class PlaylistController {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository : Repository<Playlist>,
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    @InjectRepository(Music)
    private readonly musicRepository : Repository<Music>,
    private readonly playlistService: PlaylistService,
    private readonly musicService: MusicService
  ) {}
  
  @Get(':userId/playlists')
  async getUserPlaylists(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Playlist[]> {
    return this.playlistService.getUserPlaylists(userId);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('/')
  // async create(@Request() req, @Body() createPlaylistDto: any ) {
  //   return this.playlistService.create(req.user, createPlaylistDto.name);
  // }

  @UseGuards(JwtAuthGuard)
  @Post('add/:musicId')
  async addToPlaylist(@GetOrUser() users, @Param('musicId') musicId: number) {
    const user = await this.userRepository.findOne({ where: { username: users.username } });
    const music = await this.musicRepository.findOne({ where: { id: musicId } });
    return this.playlistService.addToPlaylist(user, music);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/userplayer')
  async getUserPlaylist(@Request() req) {
    const user = await this.userRepository.findOne({ where: { username: req.user.username } });
    return this.playlistService.getUserPlaylist(user);
  }

 
  @UseGuards(JwtAuthGuard)
  @Delete('songs/:songId')
  async deleteSongFromUserPlaylist(
    @Request() req, // 요청 객체에서 사용자 정보를 추출
    @Param('songId') songId: number, // 삭제할 노래의 ID
  ): Promise<void> {
    const userId = req.user.id; // 인증된 사용자 ID 추출
  
    await this.playlistService.deleteSongFromPlaylist(userId, songId); // 노래 삭제
  }
}