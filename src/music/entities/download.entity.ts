import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Music } from 'src/music/entities/music.entity';

@Entity()
export class Download {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.downloads, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Music, music => music.downloads, { onDelete: 'CASCADE' })
  music: Music;

  @CreateDateColumn()
  downloadedAt: Date;
}
