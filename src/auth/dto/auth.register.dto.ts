import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class AuthRegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  birthdate: string;
}
