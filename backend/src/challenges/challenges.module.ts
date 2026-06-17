import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from '../entities/challenge.entity';
import { ChallengeParticipant } from '../entities/challenge-participant.entity';
import { User } from '../entities/user.entity';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';

@Module({
  imports: [TypeOrmModule.forFeature([Challenge, ChallengeParticipant, User])],
  controllers: [ChallengesController],
  providers: [ChallengesService],
})
export class ChallengesModule {}
