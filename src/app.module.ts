import { Module } from "@nestjs/common";
import { ConfigurationModule } from "./configs/configuration.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { User } from "./auth/entities/user.entity";
import { PlaylistModule } from "./playlist/playlist.module";
import { MusicModule } from "./music/music.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AudiowaveformService } from './audiowaveform/audiowaveform.service';

@Module({
  imports: [
    // .env variables
    ConfigurationModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // DB Connection
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // Change to MySQL
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    AuthModule,
    PlaylistModule,
    MusicModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AudiowaveformService],
})
export class AppModule {}