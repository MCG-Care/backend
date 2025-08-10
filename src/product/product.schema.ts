// import { Document } from 'mongoose';
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Document } from 'mongoose';

// export enum ProductType {
//   FLOORSTANDING = 'Floorstanding',
//   WINDOW = 'Window',
//   WALLSPLIT = 'Wall Split',
// }
// export enum CapacityRange {
//   RANGE_2K = '2K',
//   RANGE_7K_10K = '7K-10K',
//   RANGE_12K_18K = '12K-18K',
// }
// export enum WarrantyDate {
//   YEAR1 = '1 year',
//   YEAR2 = '2 year',
//   YEAR3 = '3 year',
// }
// export enum AvailabilityStatus {
//   AVAILABLE = 'Available',
//   OUT_OF_STOCK = 'Out of Stock',
// }

// @Schema({
//   timestamps: true,
// })
// export class Product extends Document {
//   @Prop({
//     type: String,
//     isRequired: true,
//   })
//   name: string;

//   @Prop({
//     type: String,
//     required: true,
//     unique: true,
//   })
//   productModel: string;

//   @Prop({
//     type: String,
//     isRequired: true,
//   })
//   brand: string;

//   @Prop({
//     type: String,
//     isRequired: true,
//   })
//   description: string;

//   @Prop({
//     type: Number,
//     isRequired: true,
//   })
//   price: number;

//   @Prop({
//     type: [String],
//     isRequired: true,
//   })
//   images: string[];

//   @Prop({
//     type: String,
//     isRequired: true,
//     enum: CapacityRange,
//     default: CapacityRange.RANGE_2K,
//   })
//   capacity: CapacityRange;

//   @Prop({
//     type: String,
//     isRequired: true,
//     enum: ProductType,
//     default: ProductType.FLOORSTANDING,
//   })
//   productType: ProductType;

//   @Prop({
//     type: String,
//     isRequired: true,
//     enum: WarrantyDate,
//     default: WarrantyDate.YEAR1,
//   })
//   warranty: WarrantyDate;

//   @Prop({
//     type: String,
//     enum: AvailabilityStatus,
//     default: AvailabilityStatus.AVAILABLE,
//     isRequired: true,
//   })
//   status: AvailabilityStatus;
// }

// export const ProductSchema = SchemaFactory.createForClass(Product);

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({
    type: String,
    required: true,
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
    required: true,
  })
  brand: string;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: [String],
    default: [],
  })
  images: string[];

  @Prop({
    type: Object,
    default: {},
  })
  specs: {
    capacity: string;
    type: string;
    energy_rating?: string;
    cooling_power?: string;
    refrigerant?: string;
    warranty?: string;
  };

  @Prop({
    type: Date,
  })
  release_date: Date;

  @Prop({
    type: String,
  })
  tagline: string;

  @Prop({
    type: Number,
  })
  vote_average: number;

  @Prop({
    type: Number,
  })
  vote_count: number;

  @Prop({
    type: Number,
    default: 0,
  })
  stock: number;

  @Prop({
    type: Number,
    required: true,
  })
  price: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
