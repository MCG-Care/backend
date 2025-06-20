/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './providers/product.service';
import { CreateProductDto } from './dtos/create-products.dto';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Product } from './product.schema';
import { isValidObjectId } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/auth/user.schema';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateProductDto } from './dtos/update-products.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({
    summary: 'Get all products',
  })
  @ApiResponse({
    status: 200,
    description: 'You get a 200 response if you fetch all products',
  })
  @Get()
  public async findAll() {
    return this.productService.findAll();
  }

  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectID of the product',
    example: '6643e7f4d29e3301e82a65b2',
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.productService.findById(id);
  }

  @ApiOperation({
    summary: 'Creates a new product with admin token',
  })
  @ApiResponse({
    status: 201,
    description:
      'You get a 201 response if your product is created successfully',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard())
  @Roles(UserRole.ADMIN)
  @Post('create')
  @UseInterceptors(FilesInterceptor('images')) // Accept multiple files
  public async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.createProduct(createProductDto, files);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a product with product id' })
  @ApiResponse({
    status: 200,
    description:
      'You get a 200 response if your product is updated successfully',
  })
  @UseInterceptors(FilesInterceptor('images'))
  public async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // console.log('Update DTO:', updateProductDto);
    // console.log('Uploaded files:', files);
    return this.productService.updateById(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a product with product id' })
  @ApiResponse({
    status: 200,
    description:
      'You get a 200 response if your product is deleted successfully',
  })
  public async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteById(id);
  }

  @ApiOperation({ summary: 'Search products by name or brand' })
  @ApiQuery({
    name: 'keyword',
    required: true,
    description: 'Search term for product name , brand or product model',
  })
  @ApiOkResponse({ description: 'List of matched products', type: [Product] })
  @Get('search')
  public async searchProducts(@Query('keyword') keyword: string) {
    return this.productService.searchProducts(keyword);
  }
}
