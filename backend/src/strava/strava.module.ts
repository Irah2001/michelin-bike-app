import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StravaController } from './strava.controller';
import { StravaService } from './strava.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [StravaController],
  providers: [StravaService],
})
export class StravaModule {}
