import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { Music } from '../music/entities/music.entity';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetOrUser } from 'src/decorators/get-or-user.decorator';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>,
  ) {}
  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['playlists'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.playlists;
  }

  // async create(user: User, name: string): Promise<Playlist> {
  //   const playlist = this.playlistRepository.create({ user, name, musics: [] });
  //   return this.playlistRepository.save(playlist);
  // }

  async findByUser(user: User): Promise<Playlist[]> {
    return this.playlistRepository.find({ where: { id: user.id }, relations: ['music'] });
  }



  async addToPlaylist(user: User, music: Music): Promise<Playlist> {
    const playlistEntry = this.playlistRepository.create({
      user,
      music,
      createdAt: new Date(),
    });
    return this.playlistRepository.save(playlistEntry);
  }

  async getUserPlaylist(user: User): Promise<Playlist[]> {
    return this.playlistRepository.find({
      where: { user },
      relations: ['music'],
    });
  }
  
  async deleteUserPlaylists(user: User) {
    return this.playlistRepository.delete({ user });
  }
}