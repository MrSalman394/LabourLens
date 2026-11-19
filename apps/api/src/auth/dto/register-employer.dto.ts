import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { EmployerType } from '@prisma/client';

export class RegisterEmployerDto {
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
  @IsEnum(EmployerType, { message: 'Invalid employer type' })
  employerType?: EmployerType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  ntnTaxNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^(\+92|0)[0-9]{10}$/, { message: 'Phone must be a valid Pakistani phone number (+92300... or 0300...)' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
