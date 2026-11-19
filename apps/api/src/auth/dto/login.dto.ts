import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'CNIC number is required' })
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/[\s-]/g, '') : value)
  @Matches(/^\d{13}$/, { message: 'CNIC must contain exactly 13 digits' })
  cnic: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(64)
  password: string;
}
