/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
