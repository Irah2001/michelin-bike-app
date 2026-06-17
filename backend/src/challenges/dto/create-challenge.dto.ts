import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChallengeDto {
  @ApiProperty({ description: 'UUID de l\'utilisateur créateur' })
  created_by: string;

  @ApiProperty({ example: 'Tour du Mont-Blanc' })
  title: string;

  @ApiPropertyOptional({ example: 'Parcourez 200 km en équipe en 30 jours' })
  description?: string;

  @ApiProperty({ example: 200 })
  target_km: number;

  @ApiProperty({ example: '2026-06-20T00:00:00.000Z' })
  start_date: string;

  @ApiProperty({ example: '2026-07-20T00:00:00.000Z' })
  end_date: string;

  @ApiPropertyOptional({ example: 'Kit pneus Michelin Power Road offert' })
  reward_description?: string;
}
