import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  @MinLength(2)
  name: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  password: string;
}

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  access_token: string;
}
