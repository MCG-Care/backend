/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, ServiceType } from '../booking.schema';
import { ApiProperty } from '@nestjs/swagger';

class ContactInfoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @ApiProperty()
  phone: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  building: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  street: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ward: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  state: string;
}

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  productModel: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  brandName: string;

  @IsEnum(ServiceType)
  @ApiProperty()
  serviceType: ServiceType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  videos?: string[];

  @IsDateString()
  @ApiProperty()
  bookingDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  timeSlot: string;

  @ValidateNested()
  @ApiProperty()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @ApiProperty({ example: 2500000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  serviceFee: number;

  @IsEnum(PaymentStatus)
  @ApiProperty()
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
