import { Controller, Get, Param, Query } from '@nestjs/common';
import { TaxonomyService } from '../services/taxonomy.service';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Public()
  @Get('categories')
  async getCategories() {
    return this.taxonomyService.getCategories();
  }

  @Public()
  @Get('categories/:id')
  async getCategoryById(@Param('id') id: string) {
    return this.taxonomyService.getCategoryById(id);
  }

  @Public()
  @Get('skills')
  async getSkills(@Query('categoryId') categoryId?: string) {
    return this.taxonomyService.getSkills(categoryId);
  }
}
