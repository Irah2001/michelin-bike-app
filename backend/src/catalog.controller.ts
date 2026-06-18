import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les pneus Michelin disponibles' })
  findAll() {
    return this.service.findAll();
  }

  @Get('recommend')
  @ApiOperation({ summary: 'Recommandation de pneu selon usage' })
  @ApiQuery({ name: 'usage', required: false, enum: ['road', 'gravel', 'mtb', 'urban'] })
  recommend(@Query('usage') usage?: string) {
    return this.service.recommend(usage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un pneu du catalogue' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
