import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ServiceType {
  BUDGET = 'Budget',
  NORMAL = 'Normal',
  PREMIUM = 'Premium',
}
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

@Schema({
  timestamps: true,
})
export class Booking extends Document {
  @Prop({
    type: String,
    isRequired: true,
  })
  productModel: string;

  @Prop({
    type: String,
    isRequired: true,
  })
  brandName: string;

  @Prop({
    type: String,
    isRequired: true,
    enum: ServiceType,
    default: ServiceType.NORMAL,
  })
  serviceType: ServiceType;

  @Prop({
    type: String,
    isRequired: true,
  })
  title: string;

  @Prop({
    type: String,
    isRequired: true,
  })
  description: string;

  @Prop({
    type: [String],
    default: [],
  })
  photos?: string[];

  @Prop({
    type: [String],
    default: [],
  })
  videos?: string[];

  @Prop({
    isRequired: true,
  })
  bookingDate: Date;

  @Prop({
    type: String,
    isRequired: true,
  })
  timeSlot: string;

  @Prop({
    type: {
      name: String,
      phone: [String],
      building: String,
      street: String,
      ward: String,
      state: String,
    },
    isRequired: true,
  })
  contactInfo: {
    name: string;
    phone: string[];
    building: string;
    street: string;
    ward: string;
    state: string;
  };

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  assignedTechnician?: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'assigned' | 'completed' | 'rescheduled';

  @Prop({ type: Number, default: 0 })
  serviceFee?: number;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus?: PaymentStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
