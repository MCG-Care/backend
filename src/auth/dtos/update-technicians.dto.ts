/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../user.schema';

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

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
