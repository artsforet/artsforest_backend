import { Controller, Post, Get, Body, Req, Param, UseGuards, ParseIntPipe, Put, Delete, Request } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetOrUser } from 'src/decorators/get-or-user-decorator';
import { Music } from 'src/music/entities/music.entity';

@Controller('playlist')
export class PlaylistController {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository : Repository<Playlist>,
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    @InjectRepository(Music)
    private readonly musicRepository : Repository<Music>,
    private readonly playlistService: PlaylistService
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
  @Delete('/userplayer')
  async deleteUserPlaylists(@Request() req) {
    const user = await this.userRepository.findOne({ where: { username: req.user.username } });
    return this.playlistService.deleteUserPlaylists(user);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('/')
  // async createPlaylist(@GetOrUser() user: User, @Body('name') name: string) {
  //   return this.playlistService.createPlaylist(user, name);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('/')
  // async getUserPlaylists(@GetOrUser() user: User) {
  //   return this.playlistService.getUserPlaylists(user)
  // }


  // @Post(':playlistId/musics/:musicId')
  // async addMusicToPlaylist(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Param('playlistId', ParseIntPipe) playlistId: number,
  //   @Param('musicId', ParseIntPipe) musicId: number,
  // ) {
  //   await this.playlistService.addMusicToUserPlaylist(userId, playlistId, musicId);
  //   return { message: 'Music added to playlist successfully' };
  // }
}