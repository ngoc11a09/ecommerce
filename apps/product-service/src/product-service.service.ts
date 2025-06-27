import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { BadRequestException, User } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductServiceService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async createCategory(category: Partial<Category>, user: User) {
    if (!category.parentId || !category.shopId) {
      throw new BadRequestException('Parent category or shop id is required', "MISSING_ID_FIELD");
    }
    const parentCategory = await this.categoryRepository.findOne({ where: { id: category.parentId } });
    if (!parentCategory) {
      throw new BadRequestException('Parent category not found', "CATEGORY_NOT_FOUND");
    }
    const newCategory = this.categoryRepository.create({ ...category, parent: parentCategory });
    return this.categoryRepository.save(newCategory);
  }

  async adminCreateCategory(name: string) {
    const category = {
      name,
      shopId: null,
      parentId: null,
    }
    const newCategory = this.categoryRepository.create(category);
    return this.categoryRepository.save(newCategory);
  }

  async createProduct(product: Partial<Product>, user: User, shopId: UUID) {
    console.log({ product, user, shopId });
    const category = await this.categoryRepository.findOne({ where: { id: product.categoryId } });

    if (!category || (category.shopId !== null && category.shopId !== shopId)) {
      throw new BadRequestException('Category not found', "CATEGORY_NOT_FOUND");
    }

    const newProduct = this.productRepository.create(product);
    return this.productRepository.save(newProduct);
  }
}
