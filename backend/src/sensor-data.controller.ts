import { Controller, Get, Post, Param, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Sensor Data')
@Controller('sensor-data')
export class SensorDataController {
  @Get()
  @ApiOperation({ summary: '🚧 Historique des remontées (capteur + Strava)' })
  @ApiResponse({ status: 200, description: 'Liste des remontées : distance, dénivelé, vitesse moy/max, watts, cadence, durée, date' })
  findAll() {
    throw new NotImplementedException();
  }

  @Post()
  @ApiOperation({ summary: '🚧 Enregistrer une remontée capteur (simulateur)' })
  @ApiResponse({ status: 201, description: 'Crée une entrée avec les données du capteur : distance_km, elevation_m, avg_speed, max_speed, duration_seconds, avg_watts, calories' })
  create() {
    throw new NotImplementedException();
  }

  @Post('sync')
  @ApiOperation({ summary: '🚧 Synchroniser les données depuis Strava' })
  sync() {
    throw new NotImplementedException();
  }

  @Get(':id')
  @ApiOperation({ summary: '🚧 Détail d\'une remontée' })
  findOne(@Param('id') id: string) {
    throw new NotImplementedException();
  }
}
