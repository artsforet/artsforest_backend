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

  // @ManyToOne(() => Music, (music) => music.playlists)
  // music: Music; // 여기에서 music_id가 아니라 music으로 정의됨

  @Column()
  createdAt: Date;
}