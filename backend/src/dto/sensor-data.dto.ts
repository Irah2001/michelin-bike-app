import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateSensorDataDto {
  @ApiProperty({ example: 25.4, description: 'Distance en km' })
  @IsNumber()
  @Min(0)
  distance_km: number;

  @ApiPropertyOptional({ example: 320, description: 'Dénivelé en mètres' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  elevation_m?: number;

  @ApiPropertyOptional({ example: 22.5, description: 'Vitesse moyenne km/h' })
  @IsOptional()
  @IsNumber()
  avg_speed?: number;

  @ApiPropertyOptional({ example: 45.2, description: 'Vitesse max km/h' })
  @IsOptional()
  @IsNumber()
  max_speed?: number;

  @ApiPropertyOptional({ example: 3600, description: 'Durée en secondes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_seconds?: number;

  @ApiPropertyOptional({ example: 150, description: 'Puissance moyenne watts' })
  @IsOptional()
  @IsNumber()
  avg_watts?: number;

  @ApiPropertyOptional({ example: 450, description: 'Calories' })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiPropertyOptional({ example: 80, description: 'Cadence moyenne rpm' })
  @IsOptional()
  @IsNumber()
  avg_cadence?: number;

  @ApiPropertyOptional({ example: 22, description: 'Température °C' })
  @IsOptional()
  @IsNumber()
  avg_temp?: number;

  @ApiPropertyOptional({ example: 'uuid-du-pneu' })
  @IsOptional()
  @IsUUID()
  tire_id?: string;
}
