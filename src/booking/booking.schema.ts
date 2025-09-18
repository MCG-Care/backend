import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

export enum BookingServiceCategory {
  ROUTINE_CLEANING = 'routine_cleaning',
  GAS_TOPUP_AND_LEAK_CHECK = 'gas_topup_and_leak_check',
  REPAIR_AND_FIX = 'repair_and_fix',
  INSTALLATION_AND_RELOCATION = 'installation_and_relocation',
  SPECIALIZED_TREATMENTS = 'specialized_treatments',
  OTHER_SERVICES = 'other_services',
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
  })
  title: string;

  @Prop({
    type: [String],
    enum: BookingServiceCategory,
    isRequired: true,
    default: [],
  })
  serviceTypes: BookingServiceCategory[];

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

  // @Prop({
  //   isRequired: true,
  // })
  // bookingDate: Date;

  @Prop({
    type: String,
    isRequired: true,
  })
  timeSlot: string;

  @Prop({ type: String, required: true })
  date: string;

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
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: string;

  @Prop({ type: String })
  serviceEndDate?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
