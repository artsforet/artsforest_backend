import { User } from 'src/auth/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { Music } from './music.entity';

@Entity()
@Unique(['user', 'music'])
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @JoinColumn({ name: 'music_id' })
  @ManyToOne(() => Music, (music) => music.likes)
  music: Music;
}