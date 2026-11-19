import {
  IsArray,
  ValidateNested,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilityStatus, EngagementType } from '@prisma/client';

export class AvailabilitySlotDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @IsOptional()
  @IsString()
  startTime?: string; // e.g. "09:00"

  @IsOptional()
  @IsString()
  endTime?: string; // e.g. "17:00"

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsEnum(EngagementType)
  engagementPreference?: EngagementType;
}

export class UpdateWorkerAvailabilityDto {
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availabilityStatus?: AvailabilityStatus;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  weeklySchedule?: AvailabilitySlotDto[];
}
