import {
  IsString,
  IsOptional,
  IsDateString,
  Length,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { EvidenceSource } from '@prisma/client';

export class CreateWorkerQualificationDto {
  @IsString()
  @Length(2, 160)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  issuer?: string; // e.g. "NAVTTC", "TEVTA Punjab", "Sindh Technical Education"

  @IsOptional()
  @IsString()
  @Length(2, 50)
  qualificationType?: string; // "CERTIFICATION", "DIPLOMA", "DEGREE", "VOCATIONAL_TRAINING"

  @IsOptional()
  @IsUrl()
  credentialUrl?: string;

  @IsOptional()
  @IsDateString()
  issuedOn?: string;

  @IsOptional()
  @IsDateString()
  expiresOn?: string;

  @IsOptional()
  @IsEnum(EvidenceSource)
  evidenceSource?: EvidenceSource;
}

export class UpdateWorkerQualificationDto {
  @IsOptional()
  @IsString()
  @Length(2, 160)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  issuer?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  qualificationType?: string;

  @IsOptional()
  @IsUrl()
  credentialUrl?: string;

  @IsOptional()
  @IsDateString()
  issuedOn?: string;

  @IsOptional()
  @IsDateString()
  expiresOn?: string;

  @IsOptional()
  @IsEnum(EvidenceSource)
  evidenceSource?: EvidenceSource;
}
