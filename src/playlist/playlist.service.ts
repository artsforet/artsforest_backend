import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, UseGuards, BadRequestException, UnauthorizedException } from '@nestjs/common';
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

  // 사용자의 플레이리스트 찾기
  async findPlaylistByUserId(userId: number): Promise<Playlist[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['playlists'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user.playlists;
  }

  // 특정 플레이리스트에서 노래를 제거하는 메서드
  async deleteSongFromPlaylist(userId: number, songId: number): Promise<void> {
    const playlist = await this.playlistRepository.findOne({
      where: { user: { id: userId }, music: { id: songId } }, // 사용자 ID와 노래 ID로 검색
    });

    if (!playlist) {
      throw new NotFoundException('플레이리스트에서 노래를 찾을 수 없습니다.');
    }

    await this.playlistRepository.remove(playlist); // 해당 노래를 플레이리스트에서 제거
  }

  async getPlaylistsWithSong(songTitle: string): Promise<Playlist[]> {
    return await this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoinAndSelect('playlist.songs', 'music') // 명시적으로 조인 수행
      .where('music.title = :songTitle', { songTitle })
      .getMany();
  }
}