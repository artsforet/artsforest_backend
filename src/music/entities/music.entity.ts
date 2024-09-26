import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable, OneToMany } from 'typeorm';
import { Playlist } from '../../playlist/entities/playlist.entity';
import { User } from 'src/auth/entities/user.entity';
import { Likes } from './likes.entity';
import { Download } from './download.entity';
import { Curation } from './curation.entity';
import { Pd } from './pd.entity';

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
  series: string;

  @Column({ nullable: true })
  years: number;

  @Column({ default: true })
  isPublic: boolean;

  // @Column()
  // price: number;

  @Column()
  userId: number;

  @OneToMany(() => Playlist, playlist => playlist.music)
  playlists: Playlist[];
  
  @ManyToOne(() => User, (user) => user.musics, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Likes, like => like.music)
  likes: Likes[];
  
  @Column({default: 0})
  playCount: number;
  
  @OneToMany(() => Download, download => download.music)
  downloads: Download[];

  @Column({ default: 0 })
  downloadCount: number;  // 다운로드 수 필드 추가

  @ManyToOne(() => Pd, pd => pd.songs)
  pd: Pd;


  // @OneToMany(() => Access, access => access.music)
  // accesses: Access[];

  // @ManyToMany(() => Curation, curation => curation.music)
  // curation: Curation[];
}