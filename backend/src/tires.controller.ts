import { Controller, Get, Post, Patch, Param, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Tires')
@Controller('tires')
export class TiresController {
  @Get()
  @ApiOperation({ summary: '🚧 Lister ses pneus (inclut le score d\'usure)' })
  @ApiResponse({ status: 200, description: 'Retourne les pneus avec : id, nom, total_km, wear_score, is_active, catalog info' })
  findAll() {
    throw new NotImplementedException();
  }

  @Post()
  @ApiOperation({ summary: '🚧 Ajouter un pneu à son profil' })
  create() {
    throw new NotImplementedException();
  }

  @Patch(':id')
  @ApiOperation({ summary: '🚧 Modifier un pneu (désactiver, mettre à jour km)' })
  update(@Param('id') id: string) {
    throw new NotImplementedException();
  }
}
