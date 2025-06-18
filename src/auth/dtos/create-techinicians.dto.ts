/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user.schema';
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

  @IsEnum(UserRole)
  @ApiProperty()
  role: UserRole;

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty()
  skills?: string[];
}
