import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserRole {
  ADMIN = 'Admin',
  TECHNICIAN = 'Technician',
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
    type: String,
    isRequired: true,
    enum: UserRole,
    default: UserRole.TECHNICIAN,
  })
  role: UserRole;

  @Prop({
    type: [String],
    default: [],
  })
  skills?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
