import { Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class Feedback extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'Booking',
    isRequired: true,
  })
  bookingId: Types.ObjectId;

  @Prop({
    min: 1,
    max: 5,
    isRequired: true,
  })
  rating: number;

  @Prop({
    enum: [
      'Very professional',
      'Professional',
      'Neutral',
      'Unprofessional',
      'Very unprofessional',
    ],
  })
  technicianProfessionalism: string;

  @Prop({
    enum: [
      'Very satisfied',
      'Satisfied',
      'Neutral',
      'Dissatisfied',
      'Very dissatisfied',
    ],
  })
  serviceSatsifaction: string;
  @Prop({
    type: String,
  })
  textReview?: string;
}
