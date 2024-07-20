import { User } from 'src/auth/entities/user.entity';
import { Music } from 'src/music/entities/music.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.playlists)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Music, music => music.playlists)
  @JoinColumn({ name: 'music_id' })
  music: Music;

  @Column()
  createdAt: Date;
}