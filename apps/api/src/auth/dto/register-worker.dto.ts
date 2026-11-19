import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsOptional, IsEnum, IsInt, Min, IsUUID, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { EngagementType } from '@prisma/client';

export class RegisterWorkerDto {
  @IsString()
  @IsNotEmpty({ message: 'CNIC number is required' })
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/[\s-]/g, '') : value)
  @Matches(/^\d{13}$/, { message: 'CNIC must contain exactly 13 digits' })
  cnic: string;

  @IsEmail({}, { message: 'A valid email address is required' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(64, { message: 'Password cannot exceed 64 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_-]).*$/, {
    message: 'Password must include uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword?: string;

  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;

  @IsString()
  @IsNotEmpty({ message: 'Display name is required' })
  @MaxLength(160, { message: 'Display name cannot exceed 160 characters' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  displayName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^(\+92|0)[0-9]{10}$/, { message: 'Phone must be a valid Pakistani phone number (+92300... or 0300...)' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  gender?: string;

  @IsOptional()
  @IsUUID('4', { message: 'primaryCategoryId must be a valid UUID' })
  primaryCategoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsInt({ message: 'Experience months must be an integer' })
  @Min(0, { message: 'Experience months cannot be negative' })
  experienceMonths?: number;

  @IsOptional()
  @IsEnum(EngagementType, { message: 'Invalid engagement preference' })
  preferredEngagementType?: EngagementType;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each skill ID must be a valid UUID' })
  skillIds?: string[];
}
