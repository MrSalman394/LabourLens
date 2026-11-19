import {
  IsArray,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { EngagementType } from '@prisma/client';

export class ManageEmployerPreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCategoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(EngagementType, { each: true })
  preferredEngagementTypes?: EngagementType[];

  @IsOptional()
  @IsInt()
  @Min(0)
  minExperienceMonths?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLanguages?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMaxMinor?: number;
}
