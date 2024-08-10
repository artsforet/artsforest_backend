import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable, OneToMany } from 'typeorm';
import { Playlist } from '../../playlist/entities/playlist.entity';
import { User } from 'src/auth/entities/user.entity';
import { Likes } from './likes.entity';
import { Download } from './download.entity';
import { Music } from './music.entity';

 
@Entity()
export class Pd {
  @PrimaryGeneratedColumn()
  id: number;
 
  @ManyToMany(() => Music, music => music.pd)
  @JoinTable()
  songs: Music[];
}