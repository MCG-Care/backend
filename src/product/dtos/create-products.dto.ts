import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

class ProductSpecsDto {
  @ApiProperty({ example: '1.5 Ton' })
  @IsString()
  capacity: string;

  @ApiProperty({ example: 'Split AC' })
  @IsString()
  type: string;

  @ApiProperty({ example: '5 Star', required: false })
  @IsOptional()
  @IsString()
  energy_rating?: string;

  @ApiProperty({ example: '5000W', required: false })
  @IsOptional()
  @IsString()
  cooling_power?: string;

  @ApiProperty({ example: 'R32', required: false })
  @IsOptional()
  @IsString()
  refrigerant?: string;

  @ApiProperty({ example: '1 year', required: false })
  @IsOptional()
  @IsString()
  warranty?: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  productModel: string;

  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSpecsDto)
  specs?: ProductSpecsDto;

  @IsOptional()
  release_date?: Date;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vote_average?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vote_count?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsNumber()
  @Type(() => Number)
  price: number;
}
