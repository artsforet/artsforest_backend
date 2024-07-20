import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthRegisterDto } from './dto/auth.register.dto';
import { CookieOptions, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthLoginDto } from './dto/auth.login.dto';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Music } from 'src/music/entities/music.entity';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    private readonly jwtService: JwtService,
    private config: ConfigService
  ) {}

  async signUp(authRegisterDto: AuthRegisterDto): Promise<void> {
    return this.createUser(authRegisterDto);
  }

  async createUser(authRegisterlDto: AuthRegisterDto): Promise<void> {
    const user = this.userRepository.create(authRegisterlDto);

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Existing username');
      } else {
        console.log(error);
        throw new InternalServerErrorException(error, 'Error to create user');
      }
    }
  }


  
  async login(user: any) {
    const find_user = this.findById(user.userId);

    if(!find_user) throw new Error('유저를 찾을 수 없습니다. ')

    const { password, ...userWithoutPassword } = user;
    const payload = { user: userWithoutPassword, sub: user.userId };
    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload),
    };
  }



  async getUserWithDefaultPlaylist(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId }, relations: ['playlists'] });
  }

  // async createPlaylist(userId: number, name: string): Promise<Playlist> {
  //   const user = await this.userRepository.findOne({where: {id:userId}});
  //   const playlist = this.playlistRepository.create({ name, user });
  //   return this.playlistRepository.save(playlist);
  // }

  // async addMusicToPlaylist(userId: number, playlistId: number, musicId: number): Promise<void> {
  //   const playlist = await this.playlistRepository.findOne({ where: { id: playlistId, user: { id: userId } }, relations: ['musics'] });
  //   if (!playlist) {
  //     throw new Error('Playlist not found');
  //   }
  //   const music = new Music();
  //   music.id = musicId;
  //   playlist.musics.push(music);
  //   await this.playlistRepository.save(playlist);
  // }

  // async getUserPlaylists(userId: number): Promise<Playlist[]> {
  //   return this.playlistRepository.find({ where: { user: { id: userId } }, relations: ['musics'] });
  // }
 

  async findById(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async validateUser(authLoginDto: AuthLoginDto) {
    const { username, password } = authLoginDto;

    // const user = await this._findUserByUsername(username);
    const user = await this.userRepository.findOne({ where: { username } });
    await this.comparePassword(password, user.password);
 
    return { user };
  }

  
  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

    if (!isMatch) {
      throw new HttpException('패스워드가 일치하지 않습니다.', 401);
    }
  }

    getAccessToken(payload: any, expiresIn?: number): string {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_TOKEN_SECREAT'),
      expiresIn: !Boolean(expiresIn)
        ? Number(this.config.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'))
        : expiresIn,
    });

    return accessToken;
  }

  getRefreshTokenWithCookie(payload: any): {
    refreshToken: string;
    cookieOption: CookieOptions;
  } {
    const expiresIn = Number(
      this.config.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    );

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_TOKEN_SECREAT'),
      expiresIn,
    });

    return {
      refreshToken,
      cookieOption: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: expiresIn * 1000,
      },
    };
  }

    async setCurrentRefreshToken(
    refreshToken: string,
    user: User,
  ): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this._updateRefreshToken(user, hashedRefreshToken);
  }

  async _updateRefreshToken(user: User, hashedRefreshToken?: string) {
    try {
      await this.userRepository.createQueryBuilder()
        .update(User)
        .set({ hashedRefreshToken })
        .where('id = :id', { id: user.id })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error to update refreshToken',
      );
    }
  }
  async compareRefreshToken(
    refreshToken: string,
    hashedRefreshToken: string,
  ): Promise<void> {
    try {
      const isMatch = await bcrypt.compare(refreshToken, hashedRefreshToken);
      if (!isMatch) {
        throw new UnauthorizedException(
          'RefreshToken is not match\nPlease SignIn again',
        );
      }
    } catch (error) {
      throw new UnauthorizedException(
        error,
        'Error to compareRefrshToken, please sign in again',
      );
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.getDetailQuery()
      .addSelect('user.hashedRefreshToken')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user) {
      throw new BadRequestException({}, `Can't find User with id: ${username}`);
    }

    return user;
  }

  async getUserWithLikedMusic(userId: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['likes', 'likes.music'],
    });
  }

  
  orderSelectQuery(query: SelectQueryBuilder<User>) {
    return query
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(f.id)', 'count')
          .from(User, 'f')
          .where('f.id = followers.id');
      }, 'fcount')
      .orderBy('fcount', 'DESC');
  }

  getSimpleQuery() {
    return this.userRepository.createQueryBuilder('user')
      // .loadRelationCountAndMap('user.playlistsCount', 'user.playlists')
      // .loadRelationCountAndMap('user.musicsCount', 'user.musics');
  }

  getDetailQuery() {
    return this.getSimpleQuery()
      .leftJoinAndSelect('user.musics', 'musics')
      .leftJoinAndSelect('user.playlists', 'playlists')
      .leftJoinAndSelect('playlists.musics', 'pm')
      .leftJoinAndSelect('pm.user', 'pmu')
      .leftJoinAndSelect('user.likeMusics', 'lm')
      .leftJoinAndSelect('user.repostMusics', 'rm')
      .leftJoinAndSelect('user.repostPlaylists', 'rp')
      .leftJoinAndSelect('lm.user', 'lmu')
      .leftJoinAndSelect('rm.user', 'rmu')
      .leftJoinAndSelect('rp.user', 'rpu')
      // .leftJoinAndSelect('user.followers', 'followers')
      // .leftJoinAndSelect('user.following', 'following')
      // .loadRelationCountAndMap(
      //   'followers.followersCount',
      //   'followers.followers',
      // )
      // .loadRelationCountAndMap(
      //   'following.followersCount',
      //   'following.followers',
  }
}

  // async findUserById(id: string, nullable?: boolean) {
  //   return this._findUserById(id, nullable);
  // }

  // async _findUserById(id: string, nullable?: boolean) {
  //   const user = await this.getDetailQuery()
  //     .where('user.id = :id', { id })
  //     .getOne();

  //   if (!user) {
  //     if (nullable) {
  //       return null;
  //     } else {
  //       throw new BadRequestException(`Can't find User with id: ${id}`);
  //     }
  //   }


  // ----------------------------------------------------------

  // async _findUserByUsername(username: string): Promise<User> {
  //   const user = await this.getDetailQuery()
  //     .addSelect('user.hashedRefreshToken')
  //     .addSelect('user.password')
  //     .where('user.username = :username', { username })
  //     .getOne();

  //   if (!user) {
  //     throw new BadRequestException({}, `Can't find User with id: ${username}`);
  //   }

  //   return user;
  // }
  




