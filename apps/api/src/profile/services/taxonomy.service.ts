import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all active categories with their child categories and skills count.
   */
  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        skills: {
          where: { isActive: true },
          select: {
            id: true,
            code: true,
            nameEn: true,
            nameUr: true,
          },
        },
        _count: {
          select: {
            skills: true,
            workerProfiles: true,
          },
        },
      },
      orderBy: { nameEn: 'asc' },
    });
  }

  /**
   * Returns skills, optionally filtered by categoryId.
   */
  async getSkills(categoryId?: string) {
    return this.prisma.skill.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            nameEn: true,
            nameUr: true,
            categoryType: true,
          },
        },
      },
      orderBy: { nameEn: 'asc' },
    });
  }

  /**
   * Returns single category by ID with all skills.
   */
  async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        skills: {
          where: { isActive: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }
}
