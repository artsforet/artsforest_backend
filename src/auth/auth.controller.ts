import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthRegisterPipe } from './pipes/auth-register.pipe';
import { AuthRegisterDto } from './dto/auth.register.dto';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth.login.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUser } from 'src/decorators/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetChartedDto } from 'src/music/dto/get-charted.dto';
import { GetOrUser } from 'src/decorators/get-or-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  @Get('/users')
  async getUSer() {
    return await this.userRepository.find();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@GetUser() user: User) {
    return user;
  }

  @Post('/register')
  @UsePipes(ValidationPipe, AuthRegisterPipe)
  async signUp(@Body() authRegisterDto: AuthRegisterDto): Promise<void> {
    await this.authService.signUp(authRegisterDto);
  }

  @Post('/login')
  async signIn(
    @Body(ValidationPipe) authLoginDto: AuthLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user } = await this.authService.validateUser(authLoginDto);

    const payload = { id: user.id, username: user.username };
    const accessToken = this.authService.getAccessToken(payload);
    const { refreshToken, cookieOption } =
      this.authService.getRefreshTokenWithCookie(payload);
    await this.authService.setCurrentRefreshToken(refreshToken, user);

    response.cookie('waverefresh', refreshToken, cookieOption);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedRefreshToken, password, ...userData } = user;

    return { accessToken, userData: { ...userData } };
  }

  @UseGuards(JwtAuthGuard) // JWT 가드를 사용하여 인증된 사용자만 로그아웃 할 수 있도록 합니다.
  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) response: Response, 
    @GetUser() user: User,
  ) {
    const users = user; // JWT 가드에서 추가된 사용자 정보
    await this.authService.removeRefreshToken(users.id); // 유저의 리프레시 토큰을 제거합니다.
    
    // 쿠키에서 리프레시 토큰을 제거합니다.
    response.cookie('waverefresh', '', { 
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(0),
    });

    return { message: 'Logged out successfully' };
  }


  
  // @UseGuards(JwtAuthGuard)
  // @Post(':userId/playlists')
  // async createPlaylist(@Param('userId') userId: number, @Body('name') name: string) {
  //   const playlist = await this.authService.createPlaylist(userId, name);
  //   return playlist;
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post(':userId/playlists/:playlistId/musics/:musicId')
  // async addMusicToPlaylist(
  //   @Param('userId') userId: number,
  //   @Param('playlistId') playlistId: number,
  //   @Param('musicId') musicId: number,
  // ) {
  //   await this.authService.addMusicToPlaylist(userId, playlistId, musicId);
  //   return { message: 'Music added to playlist successfully' };
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get(':userId/playlists')
  // async getUserPlaylists(@Param('userId') userId: number) {
  //   const playlists = await this.authService.getUserPlaylists(userId);
  //   return playlists;
  // }
}
