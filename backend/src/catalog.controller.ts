import { Controller, Get, Param, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  @Get()
  @ApiOperation({ summary: '🚧 Lister les pneus Michelin disponibles' })
  findAll() {
    throw new NotImplementedException();
  }

  @Get('recommend')
  @ApiOperation({ summary: '🚧 Recommandation de pneu selon usage' })
  recommend() {
    throw new NotImplementedException();
  }

  @Get(':id')
  @ApiOperation({ summary: '🚧 Détail d\'un pneu du catalogue' })
  findOne(@Param('id') id: string) {
    throw new NotImplementedException();
  }
}
