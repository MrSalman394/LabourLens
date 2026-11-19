import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsUrl,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PortfolioItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @Length(2, 120)
  title!: string;

  @IsString()
  @Length(5, 1000)
  description!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @IsOptional()
  @IsString()
  completedDate?: string;
}

export class UpdateWorkerPortfolioDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioItemDto)
  portfolioItems!: PortfolioItemDto[];
}
