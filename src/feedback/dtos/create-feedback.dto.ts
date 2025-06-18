/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ description: 'ID of the booking' })
  @IsNumber()
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
    description: 'How satisfied are you with the service?',
    enum: [
      'Very satisfied',
      'Satisfied',
      'Neutral',
      'Dissatisfied',
      'Very dissatisfied',
    ],
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
    description: 'Additional written feedback (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  textReview?: string;
}
