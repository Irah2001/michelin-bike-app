import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Friendship } from './entities/friendship.entity';
import { Challenge } from './entities/challenge.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship, Challenge]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'super-secret-key'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [JwtAuthGuard],
})
export class UsersModule {}
