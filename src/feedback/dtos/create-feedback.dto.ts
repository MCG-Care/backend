/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
  // @ApiProperty({ description: 'Mongo ObjectId of the booking' })
  // @IsMongoId()
  // @IsNotEmpty()
  // bookingId: string;

  @ApiProperty({ description: 'Star rating (1‑5)', minimum: 1, maximum: 5 })
  @Type(() => Number) // transforms "4" -> 4
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'How professional was the technician?',
    enum: [
      'Very professional',
      'Professional',
      'Neutral',
      'Unprofessional',
      'Very unprofessional',
    ],
    example: 'Professional',
  })
  @IsString()
  @IsIn([
    'Very professional',
    'Professional',
    'Neutral',
    'Unprofessional',
    'Very unprofessional',
  ])
  technicianProfessionalism: string;

  @ApiProperty({
    description: 'Overall service satisfaction',
    enum: [
      'Very satisfied',
      'Satisfied',
      'Neutral',
      'Dissatisfied',
      'Very dissatisfied',
    ],
    example: 'Satisfied',
  })
  @IsString()
  @IsIn([
    'Very satisfied',
    'Satisfied',
    'Neutral',
    'Dissatisfied',
    'Very dissatisfied',
  ])
  serviceSatisfaction: string;

  @ApiProperty({
    description: 'Additional written feedback',
    required: false,
    example: 'Great service overall!',
  })
  @IsOptional()
  @IsString()
  textReview?: string;

  @IsEnum(['Yes', 'No'])
  @IsNotEmpty()
  issueResolved: 'Yes' | 'No';
}
