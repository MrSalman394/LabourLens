import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EvidenceSource } from '@prisma/client';

export class WorkerSkillItemDto {
  @IsUUID()
  skillId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  proficiencyLevel!: number; // 1 (Beginner) to 5 (Expert)

  @IsInt()
  @Min(1)
  @Max(600)
  experienceMonths!: number;

  @IsOptional()
  @IsEnum(EvidenceSource)
  evidenceSource?: EvidenceSource;
}

export class UpdateWorkerSkillsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerSkillItemDto)
  skills!: WorkerSkillItemDto[];
}
