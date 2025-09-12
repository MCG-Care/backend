import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class CreateUserDto {
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
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiPropertyOptional({ type: AddressDto })
  address?: AddressDto;
}
