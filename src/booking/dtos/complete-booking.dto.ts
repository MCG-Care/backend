/* eslint-disable @typescript-eslint/no-unsafe-call */
// dtos/complete-booking.dto.ts
import { IsEnum, Min, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CompletionStatus {
  COMPLETED = 'completed',
}

export class CompleteBookingDto {
  @ApiProperty({ example: 300000 })
  @IsNumber()
  @Min(0)
  serviceFee?: number;

  @ApiProperty({ example: 'completed', required: false })
  @IsEnum(CompletionStatus)
  @IsOptional()
  status?: CompletionStatus;
}
