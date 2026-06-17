import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTireDto {
  @ApiProperty({ example: 'uuid-du-catalogue', description: 'ID du pneu dans le catalogue Michelin' })
  catalog_id: string;
}

export class UpdateTireDto {
  @ApiPropertyOptional({ example: false, description: 'Désactiver le pneu' })
  is_active?: boolean;

  @ApiPropertyOptional({ example: 1200.5, description: 'Total km parcourus' })
  total_km?: number;
}
