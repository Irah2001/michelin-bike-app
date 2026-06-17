import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateChallengeDto {
  @ApiProperty({ example: 'Tour de France amateur' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Parcourir 500km en 30 jours' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500, description: 'Objectif en km' })
  @IsNumber()
  @Min(1)
  target_km: number;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2026-07-31' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ example: '10% de réduction sur un pneu Michelin' })
  @IsOptional()
  @IsString()
  reward_description?: string;
}
