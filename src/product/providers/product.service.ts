import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../product.schema';
import mongoose, { Model } from 'mongoose';
import { CreateProductDto } from '../dtos/create-products.dto';
import { UpdateProductDto } from '../dtos/update-products.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async findAll() {
    return this.productModel.find();
  }

  public async findById(id: string) {
    const isValid = mongoose.isValidObjectId(id); //to throw correct error
    if (!isValid) {
      throw new BadRequestException('Please Enter Correct ID');
    }
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product Not Found');
    }
    return product;
  }

  public async createProduct(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const uploadedImages: string[] = [];
    for (const file of files) {
      const result = await this.cloudinaryService.uploadImage(file);
      if (result?.secure_url) {
        uploadedImages.push(result.secure_url); // Store image URL
      } else {
        throw new BadRequestException('Image upload failed');
      }
    }

    const productData = {
      ...createProductDto,
      images: uploadedImages,
    };
    return this.productModel.create(productData);
  }

  public async updateById(id: string, updateProductDto: UpdateProductDto) {
    // console.log('Update DTO:', updateProductDto);

    return await this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
      runValidators: true,
    });
  }
  public async deleteById(id: string) {
    return this.productModel.findByIdAndDelete(id);
  }

  public async searchProducts(keyword: string) {
    const regex = new RegExp(keyword, 'i');
    return this.productModel.find({
      $or: [
        { name: regex },
        { brand: regex },
        { productModel: { $regex: `^${keyword}$`, $options: 'i' } },
      ],
    });
  }
}
