import { Likes } from 'src/music/entities/likes.entity';
import { Music } from 'src/music/entities/music.entity';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column()
  name: string;

  @Column()
  birthdate: string;
  
  @Column({ nullable: true, select: false })
  hashedRefreshToken: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToMany(() => Music, music => music.user)
  musics: Music[];
  
  @Column({ nullable: true })
  defaultPlaylistId: number;

  @OneToMany(() => Playlist, playlist => playlist.user)
  playlists: Playlist[];
  
  @OneToMany(() => Likes, (likes) => likes.user)
  likes: Likes[];
}