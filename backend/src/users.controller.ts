import { Controller, Get, Patch, UseGuards, Req, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil complet : infos, stats, badges, level' })
  async getMe(@Req() req: any) {
    const user = await this.userRepo.findOne({
      where: { id: req.user.sub },
      relations: { user_badges: { badge: true } },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      region: user.region,
      xp: user.xp,
      level: user.level,
      level_name: user.level_name,
      is_ambassador: user.is_ambassador,
      best_distance_km: user.best_distance_km,
      best_elevation_m: user.best_elevation_m,
      badges: user.user_badges?.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        image_url: ub.badge.image_url,
        earned_at: ub.unlocked_at,
      })) || [],
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '🚧 Modifier son profil (nom, avatar, région)' })
  updateMe() {
    throw new NotImplementedException();
  }
}
