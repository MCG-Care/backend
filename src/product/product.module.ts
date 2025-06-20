import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './providers/product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    PassportModule,
    CloudinaryModule,
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
})
export class ProductModule {}
