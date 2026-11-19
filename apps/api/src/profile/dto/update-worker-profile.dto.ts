import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsArray,
  ArrayMaxSize,
  IsBoolean,
  IsUrl,
  Length,
} from 'class-validator';
import { EngagementType, ProfileVisibility, AvailabilityStatus } from '@prisma/client';

export class UpdateWorkerProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  headline?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1500)
  bio?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  primaryCategoryId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  experienceMonths?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  expectedWageHourlyMinor?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  expectedWageDailyMinor?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  expectedWageMonthlyMinor?: number;

  @IsOptional()
  @IsEnum(EngagementType)
  preferredEngagementType?: EngagementType;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availabilityStatus?: AvailabilityStatus;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsEnum(ProfileVisibility)
  profileVisibility?: ProfileVisibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  languages?: string[];
}
