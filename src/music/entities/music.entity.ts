import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable, OneToMany } from 'typeorm';
import { Playlist } from '../../playlist/entities/playlist.entity';
import { User } from 'src/auth/entities/user.entity';
import { Likes } from './likes.entity';

export const musicGenres = [
  'Hip-hop & Rap',
  'Pop',
  'R&B & Soul',
  'Electronic',
  'House',
  'Soundtrack',
  'Dance & EDM',
  'Jazz & Blues',
  'Folk & Singer-Songwriter',
  'Rock',
  'Indie',
  'Classical',
  'Piano',
  'Ambient',
  'Techno',
  'Trap',
  'Dubstep',
  'Country',
  'Metal',
  'Trance',
  'Latin',
  'Drum & Base',
  'Reggae',
  'Disco',
  'World',
];

@Entity()
export class Music {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  
  @Column()
  artist: string;

  @Column()
  description: string;

  
  @Column()
  album: string;

  @Column()
  filename: string;

  @Column()
  link: string;

  @Column()
  permalink: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true })
  coverFilename: string;
  
  
  @Column('simple-array', { nullable: true })
  category: string[];
  
  @Column('json')
  tags: string[];


  @Column('simple-array', { nullable: true, select: false })
  tagsLower: string[];

  @Column({ nullable: true })
  atmosphere: string;

  @Column({ nullable: true })
  mood: string;

  @Column()
  duration: number;

  @Column({ nullable: true })
  tempo: number; 

  @Column('json', { nullable: true })
  waveform: string;

  @Column({ nullable: true })
  instrument: string;

  @Column({ nullable: true })
  years: number;

  @Column()
  userId: number;

  @OneToMany(() => Playlist, playlist => playlist.music)
  playlists: Playlist[];
  
  @ManyToOne(() => User, (user) => user.musics, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Likes, like => like.music)
  likes: Likes[];

}