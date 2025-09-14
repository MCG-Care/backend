/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UserRole } from '../user.schema';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @Matches(/^(\+?95|0)?(9|7|6)\d{7,9}$/, {
    message:
      'Please enter a valid Myanmar phone number (e.g., 0923456789 or +95923456789)',
  })
  @ApiPropertyOptional({
    description: 'User phone number, e.g., 0923456789 or +95923456789',
  })
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableSlots?: string[];

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
