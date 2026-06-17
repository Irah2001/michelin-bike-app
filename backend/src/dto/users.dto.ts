import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jean Dupont' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar_url?: string;

  @ApiPropertyOptional({ example: 'France' })
  country?: string;

  @ApiPropertyOptional({ example: 'Pays de la Loire' })
  region?: string;

  @ApiPropertyOptional({ example: 'Nantes' })
  city?: string;
}
