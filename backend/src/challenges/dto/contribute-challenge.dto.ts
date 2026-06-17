import { ApiProperty } from '@nestjs/swagger';

export class ContributeChallengeDto {
  @ApiProperty({ description: 'UUID du participant' })
  user_id: string;

  @ApiProperty({ description: 'Kilomètres à ajouter', example: 25.5 })
  km: number;
}
