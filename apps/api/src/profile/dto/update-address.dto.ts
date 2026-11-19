import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Length,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { AddressType } from '@prisma/client';

export class UpdateAddressDto {
  @IsOptional()
  @IsEnum(AddressType)
  addressType?: AddressType;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  streetAddress?: string;

  @IsString()
  @Length(2, 120)
  locality!: string; // e.g. "Gulberg III", "F-10/2", "Clifton Block 4"

  @IsString()
  @Length(2, 100)
  city!: string; // e.g. "Lahore", "Islamabad", "Karachi"

  @IsOptional()
  @IsString()
  @Length(2, 100)
  district?: string;

  @IsString()
  @Length(2, 100)
  province!: string; // e.g. "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory"

  @IsOptional()
  @IsString()
  @Length(2, 20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string; // default PK

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number; // e.g. 31.5204

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number; // e.g. 74.3436

  @IsOptional()
  @IsBoolean()
  isExactPrivate?: boolean;
}
