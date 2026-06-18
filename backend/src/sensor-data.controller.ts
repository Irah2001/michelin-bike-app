import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SensorDataService } from './sensor-data.service';
import { CreateSensorDataDto } from './dto/sensor-data.dto';

@ApiTags('Sensor Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sensor-data')
export class SensorDataController {
  constructor(private readonly service: SensorDataService) {}

  @Get()
  @ApiOperation({ summary: 'Historique des remontées (capteur + Strava)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'since', required: false, description: 'ISO date to filter from' })
  findAll(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string, @Query('since') since?: string) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    return this.service.findAll(req.user.sub, p, l, since);
  }

  @Post()
  @ApiOperation({ summary: 'Enregistrer une remontée capteur (simulateur)' })
  create(@Req() req: any, @Body() body: CreateSensorDataDto) {
    return this.service.create(req.user.sub, body);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Synchroniser les données depuis Strava' })
  sync(@Req() req: any) {
    return this.service.syncStrava(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une remontée' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(id, req.user.sub);
  }
}
