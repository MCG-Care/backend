/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  AvailabilityStatus,
  CapacityRange,
  ProductType,
  WarrantyDate,
} from '../product.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @ApiProperty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value?.trim())
  productModel: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  @IsOptional()
  images?: string[];

  @IsEnum(CapacityRange)
  @Transform(({ value }) => value?.trim())
  @ApiProperty()
  capacity: CapacityRange;

  @IsEnum(WarrantyDate)
  @Transform(({ value }) => value?.trim())
  @ApiProperty()
  warranty: WarrantyDate;

  @IsEnum(AvailabilityStatus)
  @Transform(({ value }) => value?.trim())
  @ApiProperty()
  status: AvailabilityStatus;

  @IsEnum(ProductType)
  @ApiProperty()
  @Transform(({ value }) => value?.trim())
  productType: ProductType;
}
