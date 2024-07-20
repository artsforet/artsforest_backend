import { User } from 'src/auth/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { Music } from './music.entity';

@Entity()
@Unique(['user', 'music'])
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @ManyToOne(() => Music, (music) => music.likes)
  music: Music;
}