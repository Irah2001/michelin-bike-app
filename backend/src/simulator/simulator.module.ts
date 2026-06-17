import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from '../entities/sensor.entity';
import { Ride } from '../entities/ride.entity';
import { SensorReading } from '../entities/sensor-reading.entity';
import { RideReading } from '../entities/ride-reading.entity';
import { WearEstimate } from '../entities/wear-estimate.entity';
import { SensorRecord } from '../entities/sensor-record.entity';
import { User } from '../entities/user.entity';
import { Tire } from '../entities/tire.entity';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { Challenge } from '../entities/challenge.entity';
import { ChallengeParticipant } from '../entities/challenge-participant.entity';
import { SensorGateway } from './sensor.gateway';
import { SimulatorService } from './simulator.service';
import { SimulatorController } from './simulator.controller';
import { HypertableInitService } from './hypertable-init.service';
import { SensorDataService } from '../sensor-data.service';
import { BadgesService } from '../badges.service';
import { StravaService } from '../strava/strava.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, Ride, SensorReading, RideReading, WearEstimate, SensorRecord, User, Tire, Badge, UserBadge, Challenge, ChallengeParticipant]),
  ],
  controllers: [SimulatorController],
  providers: [SimulatorService, SensorGateway, HypertableInitService, SensorDataService, BadgesService, StravaService],
})
export class SimulatorModule {}
