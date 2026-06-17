import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateTireDto {
  @ApiProperty({ example: 'uuid-du-catalogue' })
  @IsUUID()
  catalog_id: string;
}

export class UpdateTireDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 1200.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_km?: number;
}
