import { Controller, Get, Patch, Param, Body, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateUserDto } from './dto/users.dto';

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
    if (!user) throw new NotFoundException();
    return this.formatProfile(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier son profil (nom, avatar, localisation)' })
  async updateMe(@Req() req: any, @Body() body: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: req.user.sub } });
    if (!user) throw new NotFoundException();
    if (body.name !== undefined) user.name = body.name;
    if (body.avatar_url !== undefined) user.avatar_url = body.avatar_url;
    if (body.country !== undefined) user.country = body.country;
    if (body.region !== undefined) user.region = body.region;
    if (body.city !== undefined) user.city = body.city;
    await this.userRepo.save(user);
    const updated = await this.userRepo.findOne({ where: { id: req.user.sub }, relations: { user_badges: { badge: true } } });
    return this.formatProfile(updated!);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Leaderboard global (classement par XP, filtrable par région/pays)' })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async leaderboard(
    @Query('country') country?: string,
    @Query('region') region?: string,
    @Query('limit') limit?: string,
  ) {
    const qb = this.userRepo.createQueryBuilder('u')
      .select(['u.id', 'u.name', 'u.avatar_url', 'u.xp', 'u.level', 'u.level_name', 'u.country', 'u.region', 'u.city'])
      .orderBy('u.xp', 'DESC');

    if (country) qb.andWhere('u.country = :country', { country });
    if (region) qb.andWhere('u.region = :region', { region });
    qb.take(Number(limit) || 50);

    const users = await qb.getMany();
    return users.map((u, i) => ({ rank: i + 1, ...u }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Profil public d\'un utilisateur' })
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { user_badges: { badge: true } },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return this.formatProfile(user);
  }

  private formatProfile(user: User) {
    return {
      id: user.id,
      name: user.name,
      avatar_url: user.avatar_url,
      country: user.country,
      region: user.region,
      city: user.city,
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
}
