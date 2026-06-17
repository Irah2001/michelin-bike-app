import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TiresService } from './tires.service';
import { CreateTireDto, UpdateTireDto } from './dto/tires.dto';

@ApiTags('Tires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tires')
export class TiresController {
  constructor(private readonly service: TiresService) {}

  @Get()
  @ApiOperation({ summary: 'Lister ses pneus (inclut wear_score)' })
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un pneu à son profil' })
  create(@Req() req: any, @Body() body: CreateTireDto) {
    return this.service.create(req.user.sub, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un pneu (désactiver, mettre à jour km)' })
  update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateTireDto) {
    return this.service.update(id, req.user.sub, body);
  }
}
