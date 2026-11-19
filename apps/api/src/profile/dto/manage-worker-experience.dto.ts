import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  Length,
  IsEnum,
} from 'class-validator';
import { EvidenceSource } from '@prisma/client';

export class CreateWorkerExperienceDto {
  @IsString()
  @Length(2, 120)
  roleTitle!: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  employerName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsDateString()
  startedOn!: string;

  @IsOptional()
  @IsDateString()
  endedOn?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsEnum(EvidenceSource)
  evidenceSource?: EvidenceSource;
}

export class UpdateWorkerExperienceDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  roleTitle?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  employerName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsDateString()
  startedOn?: string;

  @IsOptional()
  @IsDateString()
  endedOn?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsEnum(EvidenceSource)
  evidenceSource?: EvidenceSource;
}
