import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
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
  @IsString()
  @Matches(/^(\+?95|0)?(9|7|6)\d{7,9}$/, {
    message: 'Please enter a valid Myanmar phone number',
  })
  @ApiPropertyOptional({
    description: 'User phone number, e.g., 0923456789 or +95923456789',
  })
  phone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiPropertyOptional({ type: AddressDto })
  address?: AddressDto;
}
