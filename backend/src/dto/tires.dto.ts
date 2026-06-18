import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsBoolean, IsNumber, IsString, Min } from 'class-validator';

export class CreateTireDto {
  @ApiProperty({ example: 'uuid-du-catalogue' })
  @IsUUID()
  catalog_id: string;

  @ApiPropertyOptional({ example: 'front' })
  @IsOptional()
  @IsString()
  position?: string;
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
