import { Body, Controller, Get, Injectable, Param, Post, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthRegisterPipe } from "./pipes/auth-register.pipe";
import { AuthRegisterDto } from "./dto/auth.register.dto";
import { AuthService } from "./auth.service";
import { AuthLoginDto } from "./dto/auth.login.dto";
import { User } from "./entities/user.entity";
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GetUser } from "src/decorators/get-user.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller('auth')
export class AuthController{
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private authService: AuthService
    ){}



@Get('/users')
async getUSer(){
  return await this.userRepository.find();
}

@UseGuards(JwtAuthGuard)
@Get('/profile')
async getProfile(
  @GetUser() user: User
){
  return user;
}


@Post('/register')
@UsePipes(ValidationPipe, AuthRegisterPipe)
async signUp(
  @Body() authRegisterDto: AuthRegisterDto,
): Promise<void> {
  await this.authService.signUp(authRegisterDto);
}

@Post('/login')
async signIn(
  @Body(ValidationPipe) authLoginDto: AuthLoginDto,
  @Res({ passthrough: true }) response: Response,
) {
  const { user } = await this.authService.validateUser(
    authLoginDto,
  );

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
