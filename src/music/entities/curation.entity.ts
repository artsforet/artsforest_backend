import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable, OneToMany } from 'typeorm';
import { Playlist } from '../../playlist/entities/playlist.entity';
import { User } from 'src/auth/entities/user.entity';
import { Likes } from './likes.entity';
import { Download } from './download.entity';
import { Music } from './music.entity';

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


export const series = [
  '브이로그',
  '귀여운 음악', 
  '코믹',
  '기쁨과 환희', 
  '잔잔한 음악',
  '행사 음악',
  '광고 음악',
  '할리우드',
  '세계 음악', 
  '인트로 음악',
  '시사',
  '공포 미스터리',
  '배경음악의 정석', 
  '힙합 R&B',
  '배경음악 팩토리',
  '테마',
  '자장가',
  '계절'
]

@Entity()
export class Curation {
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