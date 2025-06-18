/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import {
  AvailabilityStatus,
  CapacityRange,
  ProductType,
  WarrantyDate,
} from '../product.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  productModel: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  price: number;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  images: string[];

  @IsEnum(CapacityRange)
  @ApiProperty()
  capacity: CapacityRange;

  @IsEnum(ProductType)
  @ApiProperty()
  productType: ProductType;

  @IsEnum(WarrantyDate)
  @ApiProperty()
  warranty: WarrantyDate;

  @IsEnum(AvailabilityStatus)
  @ApiProperty()
  status: AvailabilityStatus;
}
