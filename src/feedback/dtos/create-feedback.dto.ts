import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProfessionalismLevel {
  VERY_PROFESSIONAL = 'Very professional',
  PROFESSIONAL = 'Professional',
  NEUTRAL = 'Neutral',
  UNPROFESSIONAL = 'Unprofessional',
  VERY_UNPROFESSIONAL = 'Very unprofessional',
}

export enum SatisfactionLevel {
  VERY_SATISFIED = 'Very satisfied',
  SATISFIED = 'Satisfied',
  NEUTRAL = 'Neutral',
  DISSATISFIED = 'Dissatisfied',
  VERY_DISSATISFIED = 'Very dissatisfied',
}

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Star rating (1‑5)', minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'How professional was the technician?',
    enum: ProfessionalismLevel,
    example: ProfessionalismLevel.PROFESSIONAL,
  })
  @IsEnum(ProfessionalismLevel)
  technicianProfessionalism: ProfessionalismLevel;

  @ApiProperty({
    description: 'Overall service satisfaction',
    enum: SatisfactionLevel,
    example: SatisfactionLevel.SATISFIED,
  })
  @IsEnum(SatisfactionLevel)
  serviceSatisfaction: SatisfactionLevel;

  @ApiProperty({
    description: 'Additional written feedback (max 500 chars)',
    required: false,
    example: 'Great service overall!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  textReview?: string;

  @ApiProperty({
    description: 'Was the issue resolved?',
    enum: ['Yes', 'No'],
    example: 'Yes',
  })
  @IsEnum(['Yes', 'No'])
  @IsNotEmpty()
  issueResolved: 'Yes' | 'No';
}
