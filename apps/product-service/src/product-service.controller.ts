import { Controller, Get } from '@nestjs/common';
import { ProductServiceService } from './product-service.service';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { Category } from './entities/category.entity';
import { User } from '@app/common';
import { UUID } from 'crypto';
import { Product } from './entities/product.entity';

@Controller()
export class ProductServiceController {
  constructor(private readonly productServiceService: ProductServiceService) { }

  @GrpcMethod('ProductService', 'CreateCategory')
  createCategory(@Payload() data: { category: Partial<Category>, user: User }) {
    return this.productServiceService.createCategory(data.category, data.user);
  }

  @GrpcMethod('ProductService', 'AdminCreateCategory')
  adminCreateCategory(@Payload() data: { name: string }) {
    return this.productServiceService.adminCreateCategory(data.name);
  }

  @GrpcMethod('ProductService', 'CreateProduct')
  createProduct(@Payload() data: { product: Partial<Product>, user: User, shopId: UUID }) {
    return this.productServiceService.createProduct(data.product, data.user, data.shopId);
  }
}
