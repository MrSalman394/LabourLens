import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  Length,
} from 'class-validator';
import { EmployerType } from '@prisma/client';

export class UpdateEmployerProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  businessName?: string;

  @IsOptional()
  @IsEnum(EmployerType)
  employerType?: EmployerType;

  @IsOptional()
  @IsString()
  @Length(0, 1500)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  ntnTaxNumber?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
}
