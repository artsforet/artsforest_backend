import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UploadMusicDataDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: true, description: '음악 고유주소' })
  @IsNotEmpty()
  @IsString()
  permalink: string;

  @ApiProperty({ required: true, description: '음악 길이(초)' })
  @IsNotEmpty()
  @IsNumberString()
  @IsNumber()
  duration: number;


  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  category?: string[];

  @ApiProperty({
    description: 'JSON string representing a list of tags',
    example: '["tag1", "tag2"]'
  })
  @IsOptional()
  @IsString()
  @IsJSON()
  tags?: string[];


  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  // Music Metadata
  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // album?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  albumartist?: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // atomsphare?: string;
  // @ApiProperty()
  // @IsOptional()
  // @IsArray()
  // composer?: string[];

  @IsString()
  mood?: string;
  
  @IsString()
  instrument?: string;
 
  @ApiProperty()
  @IsOptional()
  @IsString()
  year?: number;

  // @ApiProperty()
  // @IsOptional()
  // @IsArray()
  // lyrics?: string[];
}
