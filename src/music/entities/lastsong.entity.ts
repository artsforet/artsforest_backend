import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable, OneToMany } from 'typeorm';
import { Playlist } from '../../playlist/entities/playlist.entity';
import { User } from 'src/auth/entities/user.entity';
import { Likes } from './likes.entity';
import { Download } from './download.entity';
import { Music } from './music.entity';

 
@Entity()
export class LastSong{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  cover: string;
  
  @ManyToMany(() => Music)
  @JoinTable()
  songs: Music[];
}