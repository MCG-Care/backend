import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../user.schema';

class AddressDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'User region, e.g., Yangon' })
  region?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'User township, e.g., South Okkalapa' })
  township?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiPropertyOptional({ type: AddressDto })
  address?: AddressDto;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ enumName: 'UserRole' })
  role?: UserRole;

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
  @ApiPropertyOptional({ type: [String], description: 'Technician skills' })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ type: [String], description: 'Available time slots' })
  availableSlots?: string[];
}
