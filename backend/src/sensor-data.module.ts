import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SensorDataController } from './sensor-data.controller';
import { SensorDataService } from './sensor-data.service';
import { SensorRecord } from './entities/sensor-record.entity';
import { User } from './entities/user.entity';
import { Tire } from './entities/tire.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { StravaService } from './strava/strava.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorRecord, User, Tire]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'super-secret-key'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [SensorDataController],
  providers: [SensorDataService, JwtAuthGuard, StravaService],
})
export class SensorDataModule {}
