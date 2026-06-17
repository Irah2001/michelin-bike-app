import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SimulatorService } from './simulator.service';

@ApiTags('Simulator')
@Controller()
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post('simulator/start')
  @ApiOperation({ summary: 'Start the ESP32 sensor simulation' })
  start() {
    return this.simulatorService.start();
  }

  @Post('simulator/stop')
  @ApiOperation({ summary: 'Stop the ESP32 sensor simulation' })
  stop() {
    return this.simulatorService.stop();
  }

  @Get('sensor-readings/:rideId')
  @ApiOperation({ summary: 'Get all sensor readings for a ride' })
  getSensorReadings(@Param('rideId') rideId: string) {
    return this.simulatorService.getSensorReadings(rideId);
  }

  @Get('ride-readings/:rideId')
  @ApiOperation({ summary: 'Get all ride readings for a ride' })
  getRideReadings(@Param('rideId') rideId: string) {
    return this.simulatorService.getRideReadings(rideId);
  }

  @Get('wear-estimates/:rideId')
  @ApiOperation({ summary: 'Get all wear estimates for a ride' })
  getWearEstimates(@Param('rideId') rideId: string) {
    return this.simulatorService.getWearEstimates(rideId);
  }
}
