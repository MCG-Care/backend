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
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './providers/product.service';
import { CreateProductDto } from './dtos/create-products.dto';
import {
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
  @UseGuards(AuthGuard())
  @Roles(UserRole.ADMIN)
  @Post('create')
  public async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
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
  public async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
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
