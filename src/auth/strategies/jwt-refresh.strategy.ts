import { AuthService } from './../auth.service';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.waverefresh;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_REFRESH_TOKEN_SECRET ||
        config.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload) {
    const refreshToken = req.cookies?.waverefresh;
    if (!refreshToken) {
      throw new UnauthorizedException("There's no refresh token");
    }

    const { username } = payload;
    const user: User = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.hashedRefreshToken')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
    if (!user) {
      throw new UnauthorizedException("Can't find user");
    }

    const { hashedRefreshToken } = user;
    await this.authService.compareRefreshToken(
      refreshToken,
      hashedRefreshToken,
    );

    return user;
  }
}
