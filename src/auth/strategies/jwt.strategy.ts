import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const user: User = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.hashedRefreshToken')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
