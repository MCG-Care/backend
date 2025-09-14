/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+?95|0)?(9|7|6)\d{7,9}$/, {
    message: 'Please enter a valid Myanmar phone number',
  })
  @ApiPropertyOptional({
    description: 'User phone number, e.g., 0923456789 or +95923456789',
  })
  phone?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  skills?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    example: ['09:00 AM', '01:00 PM'],
    description: 'Available slots in format  HH:MM AM/PM',
  })
  availableSlots: string[];
}
