import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StravaModule } from './strava/strava.module';
import { SimulatorModule } from './simulator/simulator.module';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { SensorDataController } from './sensor-data.controller';
import { TiresController } from './tires.controller';
import { CatalogController } from './catalog.controller';
import { ChallengesController } from './challenges.controller';
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
  ],
  controllers: [AppController, AuthController, UsersController, SensorDataController, TiresController, CatalogController, ChallengesController],
  providers: [AppService],
})
export class AppModule {}
