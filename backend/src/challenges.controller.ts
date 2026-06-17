import { Controller, Get, Post, Param, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengesController {
  @Get()
  @ApiOperation({ summary: '🚧 Lister les challenges actifs' })
  findAll() {
    throw new NotImplementedException();
  }

  @Post()
  @ApiOperation({ summary: '🚧 Créer un challenge' })
  create() {
    throw new NotImplementedException();
  }

  @Post(':id/join')
  @ApiOperation({ summary: '🚧 Rejoindre un challenge' })
  join(@Param('id') id: string) {
    throw new NotImplementedException();
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: '🚧 Classement du challenge' })
  leaderboard(@Param('id') id: string) {
    throw new NotImplementedException();
  }
}
