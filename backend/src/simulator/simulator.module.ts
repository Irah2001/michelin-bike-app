import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from '../entities/sensor.entity';
import { Ride } from '../entities/ride.entity';
import { SensorReading } from '../entities/sensor-reading.entity';
import { RideReading } from '../entities/ride-reading.entity';
import { WearEstimate } from '../entities/wear-estimate.entity';
import { SensorGateway } from './sensor.gateway';
import { SimulatorService } from './simulator.service';
import { SimulatorController } from './simulator.controller';
import { HypertableInitService } from './hypertable-init.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, Ride, SensorReading, RideReading, WearEstimate]),
  ],
  controllers: [SimulatorController],
  providers: [SimulatorService, SensorGateway, HypertableInitService],
})
export class SimulatorModule {}
