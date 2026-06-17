import { Controller, Get, Patch, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Profil complet : infos, stats, badges, level' })
  @ApiResponse({ status: 200, description: 'Retourne user + xp + level + badges débloqués + stats (total_km, total_rides, best_distance, best_elevation)' })
  getMe() {
    throw new NotImplementedException();
  }

  @Patch('me')
  @ApiOperation({ summary: '🚧 Modifier son profil (nom, avatar, région)' })
  updateMe() {
    throw new NotImplementedException();
  }
}
