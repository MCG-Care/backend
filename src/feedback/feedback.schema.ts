import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Feedback extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  })
  bookingId: Types.ObjectId;

  @Prop({
    type: Number,
    min: 1,
    max: 5,
    required: true,
  })
  rating: number;

  @Prop({
    type: String,
    enum: [
      'Very professional',
      'Professional',
      'Neutral',
      'Unprofessional',
      'Very unprofessional',
    ],
    required: true,
  })
  technicianProfessionalism: string;

  @Prop({
    type: String,
    enum: [
      'Very satisfied',
      'Satisfied',
      'Neutral',
      'Dissatisfied',
      'Very dissatisfied',
    ],
    required: true,
  })
  serviceSatisfaction: string;

  @Prop({
    type: String,
  })
  textReview?: string;
}
export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
