import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StravaModule } from './strava/strava.module';
import { SimulatorModule } from './simulator/simulator.module';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { SensorDataModule } from './sensor-data.module';
import { TiresModule } from './tires.module';
import { CatalogModule } from './catalog.module';
import { ChallengesModule } from './challenges.module';
import {
  User, Catalog, Tire, SensorRecord, Badge, UserBadge, Challenge, ChallengeParticipant, Level,
  Sensor, Ride, SensorReading, RideReading, WearEstimate,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5433),
        username: config.get('DB_USER', 'michelin_admin'),
        password: config.get('DB_PASSWORD', 'michelin_password'),
        database: config.get('DB_NAME', 'michelin_bike_db'),
        entities: [
          User, Catalog, Tire, SensorRecord, Badge, UserBadge, Challenge, ChallengeParticipant, Level,
          Sensor, Ride, SensorReading, RideReading, WearEstimate,
        ],
        synchronize: true,
      }),
    }),
    StravaModule,
    SimulatorModule,
    AuthModule,
    UsersModule,
    SensorDataModule,
    TiresModule,
    CatalogModule,
    ChallengesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
