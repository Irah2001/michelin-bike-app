import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/challenges.dto';

@ApiTags('Challenges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly service: ChallengesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les challenges actifs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll(Math.max(1, Number(page) || 1), Math.min(100, Number(limit) || 20), req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un challenge' })
  create(@Req() req: any, @Body() body: CreateChallengeDto) {
    return this.service.create(req.user.sub, body);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Rejoindre un challenge' })
  join(@Req() req: any, @Param('id') id: string) {
    return this.service.join(id, req.user.sub);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Classement du challenge' })
  leaderboard(@Param('id') id: string) {
    return this.service.leaderboard(id);
  }
}
