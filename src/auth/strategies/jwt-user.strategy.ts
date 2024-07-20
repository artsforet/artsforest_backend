// import { HistoryRepository } from '../../history/history.repository';
import { ConfigService } from '@nestjs/config';
// import { User } from 'src/entities/user.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(
    private authService: AuthService,
    // private historyRepository: HistoryRepository,
    readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_ACCESS_TOKEN_SECRET ||
        config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload) {
    const { username } = payload;
    const user: User = await this.authService.findUserByUsername(username);
    // const historys = await this.historyRepository.findHistorysByUserId(
    //   user.id,
    //   {
    //     skip: 0,
    //     take: 10,
    //   },
    // );

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException();
    }

    return { ...user};
    // return { ...user, historys };
  }
}
