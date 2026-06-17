import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StravaModule } from './strava/strava.module';
import { User, Catalog, Tire, Ride, Badge, UserBadge, Challenge, ChallengeParticipant, Level } from './entities';

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
        entities: [User, Catalog, Tire, Ride, Badge, UserBadge, Challenge, ChallengeParticipant, Level],
        synchronize: true, // Auto-create tables (dev only)
      }),
    }),
    StravaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
