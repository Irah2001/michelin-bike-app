import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChallengeDto {
  @ApiProperty({ example: 'Tour de France amateur' })
  title: string;

  @ApiPropertyOptional({ example: 'Parcourir 500km en 30 jours' })
  description?: string;

  @ApiProperty({ example: 500, description: 'Objectif en km' })
  target_km: number;

  @ApiProperty({ example: '2026-07-01', description: 'Date de début' })
  start_date: string;

  @ApiProperty({ example: '2026-07-31', description: 'Date de fin' })
  end_date: string;

  @ApiPropertyOptional({ example: '10% de réduction sur un pneu Michelin' })
  reward_description?: string;
}
