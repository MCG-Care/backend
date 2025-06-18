/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-products.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
