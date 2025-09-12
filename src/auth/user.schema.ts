import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserRole {
  ADMIN = 'Admin',
  TECHNICIAN = 'Technician',
  USER = 'User',
}

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({
    type: String,
    isRequired: true,
  })
  name: string;

  @Prop({
    type: String,
    isRequired: true,
  })
  email: string;

  @Prop({
    type: String,
    isRequired: true,
  })
  password: string;

  @Prop({
    type: {
      region: { type: String },
      township: { type: String },
    },
    _id: false,
  })
  address?: {
    region?: string;
    township?: string;
  };

  @Prop({
    type: String,
    isRequired: true,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: [String],
    default: [],
  })
  skills?: string[];

  @Prop({
    type: [String],
    default: [],
  })
  availableSlots?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
