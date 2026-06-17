import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSensorDataDto {
  @ApiProperty({ example: 25.4, description: 'Distance en km' })
  distance_km: number;

  @ApiPropertyOptional({ example: 320, description: 'Dénivelé en mètres' })
  elevation_m?: number;

  @ApiPropertyOptional({ example: 22.5, description: 'Vitesse moyenne km/h' })
  avg_speed?: number;

  @ApiPropertyOptional({ example: 45.2, description: 'Vitesse max km/h' })
  max_speed?: number;

  @ApiPropertyOptional({ example: 3600, description: 'Durée en secondes' })
  duration_seconds?: number;

  @ApiPropertyOptional({ example: 150, description: 'Puissance moyenne en watts' })
  avg_watts?: number;

  @ApiPropertyOptional({ example: 450, description: 'Calories brûlées' })
  calories?: number;

  @ApiPropertyOptional({ example: 80, description: 'Cadence moyenne rpm' })
  avg_cadence?: number;

  @ApiPropertyOptional({ example: 22, description: 'Température moyenne °C' })
  avg_temp?: number;

  @ApiPropertyOptional({ example: 'uuid-du-pneu', description: 'ID du pneu utilisé' })
  tire_id?: string;
}
