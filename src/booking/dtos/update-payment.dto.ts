/* eslint-disable @typescript-eslint/no-unsafe-call */
// dtos/update-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentStatus } from '../booking.schema';

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}
