import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { JoinChallengeDto } from './dto/join-challenge.dto';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les challenges actifs' })
  @ApiResponse({ status: 200, description: 'Liste des challenges avec participants et créateur' })
  findAll() {
    return this.challengesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un challenge' })
  @ApiParam({ name: 'id', description: 'UUID du challenge' })
  @ApiResponse({ status: 200, description: 'Challenge avec participants et créateur' })
  @ApiResponse({ status: 404, description: 'Challenge introuvable' })
  findOne(@Param('id') id: string) {
    return this.challengesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un challenge (ambassadeurs uniquement)' })
  @ApiBody({ type: CreateChallengeDto })
  @ApiResponse({ status: 201, description: 'Challenge créé' })
  @ApiResponse({ status: 403, description: 'L\'utilisateur n\'est pas ambassadeur' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  create(@Body() dto: CreateChallengeDto) {
    return this.challengesService.create(dto);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejoindre un challenge' })
  @ApiParam({ name: 'id', description: 'UUID du challenge' })
  @ApiBody({ type: JoinChallengeDto })
  @ApiResponse({ status: 200, description: 'Participation enregistrée' })
  @ApiResponse({ status: 404, description: 'Challenge introuvable' })
  @ApiResponse({ status: 409, description: 'Déjà participant ou challenge inactif' })
  join(@Param('id') id: string, @Body() dto: JoinChallengeDto) {
    return this.challengesService.join(id, dto.user_id);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Classement du challenge' })
  @ApiParam({ name: 'id', description: 'UUID du challenge' })
  @ApiResponse({ status: 200, description: 'Classement des participants triés par km contributés' })
  @ApiResponse({ status: 404, description: 'Challenge introuvable' })
  leaderboard(@Param('id') id: string) {
    return this.challengesService.leaderboard(id);
  }
}
