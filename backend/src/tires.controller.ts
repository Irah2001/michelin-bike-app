import { Controller, Get, Post, Patch, Param, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tires')
@Controller('tires')
export class TiresController {
  @Get()
  @ApiOperation({ summary: '🚧 Lister ses pneus' })
  findAll() {
    throw new NotImplementedException();
  }

  @Post()
  @ApiOperation({ summary: '🚧 Ajouter un pneu à son profil' })
  create() {
    throw new NotImplementedException();
  }

  @Patch(':id')
  @ApiOperation({ summary: '🚧 Modifier un pneu (désactiver, changer km)' })
  update(@Param('id') id: string) {
    throw new NotImplementedException();
  }

  @Get(':id/wear')
  @ApiOperation({ summary: '🚧 Score d\'usure du pneu' })
  getWear(@Param('id') id: string) {
    throw new NotImplementedException();
  }
}
