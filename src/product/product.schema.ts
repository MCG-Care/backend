import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ProductType {
  FLOORSTANDING = 'Floorstanding',
  WINDOW = 'Window',
  WALLSPLIT = 'Wall Split',
}
export enum CapacityRange {
  RANGE_2K = '2K',
  RANGE_7K_10K = '7K-10K',
  RANGE_12K_18K = '12K-18K',
}
export enum WarrantyDate {
  YEAR1 = '1 year',
  YEAR2 = '2 year',
  YEAR3 = '3 year',
}
export enum AvailabilityStatus {
  AVAILABLE = 'Available',
  OUT_OF_STOCK = 'Out of Stock',
}

@Schema({
  timestamps: true,
})
export class Product extends Document {
  @Prop({
    type: String,
    isRequired: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  productModel: string;

  @Prop({
    type: String,
    isRequired: true,
  })
  brand: string;

  @Prop({
    type: String,
    isRequired: true,
  })
  description: string;

  @Prop({
    type: Number,
    isRequired: true,
  })
  price: number;

  @Prop({
    type: [String],
    isRequired: true,
  })
  images: string[];

  @Prop({
    type: String,
    isRequired: true,
    enum: CapacityRange,
    default: CapacityRange.RANGE_2K,
  })
  capacity: CapacityRange;

  @Prop({
    type: String,
    isRequired: true,
    enum: ProductType,
    default: ProductType.FLOORSTANDING,
  })
  productType: ProductType;

  @Prop({
    type: String,
    isRequired: true,
    enum: WarrantyDate,
    default: WarrantyDate.YEAR1,
  })
  warranty: WarrantyDate;

  @Prop({
    type: String,
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
    isRequired: true,
  })
  status: AvailabilityStatus;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
