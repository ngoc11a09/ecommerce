import { Body, Controller, Get, Inject, OnModuleInit, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UUID } from 'crypto';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Action, AppAbility, CheckPolicies, PoliciesGuard, User } from '@app/common';
import { Shop } from 'apps/shop-service/src/entities/shop.entity';
import { JwtAuthGuard } from '@app/auth';
import { GetUser } from '@app/common';
import { Category } from 'apps/product-service/src/entities/category.entity';
import { Product } from 'apps/product-service/src/entities/product.entity';
import { ShopMember } from 'apps/shop-service/src/entities/shop-member.entity';
import { ShopPoliciesGuard } from './guards/shop-policies.guard';

interface UserServiceGrpc {
  getUser(data: { id: UUID }): Observable<User>;
}

interface AuthServiceGrpc {
  GGLogin(data: { code: string }): Observable<{ accessToken: string, user: User }>;
  AdminLogin(data: { email: string; password: string }): Observable<{ accessToken: string, user: User }>;
}

export interface ShopServiceGrpc {
  createShop(data: { shop: Partial<Shop>, user: User }): Observable<Shop>;
  getShopMemberRole(data: { userId: UUID, shopId: UUID }): Observable<ShopMember>;
}

interface ProductServiceGrpc {
  createCategory(data: { category: Partial<Category>, user: User }): Observable<Category>;
  createProduct(data: { product: Partial<Product>, user: User, shopId: UUID }): Observable<Product>;
  adminCreateCategory(data: { name: string }): Observable<Category>;
}

@Controller('user')
export class UserController implements OnModuleInit {
  private userService: UserServiceGrpc;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) { }

  onModuleInit() {
    this.userService = this.client.getService<UserServiceGrpc>('UserService');
  }

  @Get(':id')
  async getUser(@Param('id') id: UUID) {
    return firstValueFrom(this.userService.getUser({ id }));
  }
}

@Controller('auth')
export class AuthController {
  private authServiceGrpc: AuthServiceGrpc;

  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientGrpc,
    private readonly configService: ConfigService,
  ) { }

  onModuleInit() {
    this.authServiceGrpc = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  @Get('google')
  redirectToGoogle(@Res() res: Response) {
    const redirectUri = encodeURIComponent(this.configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback');
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const scope = encodeURIComponent('email profile');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const result = await lastValueFrom(
      this.authServiceGrpc.GGLogin({ code }),
    );
    res.json({ access_token: result.accessToken?.toString(), user: result.user });
    return;
  }

  @Post('admin-login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    return firstValueFrom(this.authServiceGrpc.AdminLogin(body));
  }
}

@Controller('shop')
@UseGuards(JwtAuthGuard, ShopPoliciesGuard)
export class ShopController implements OnModuleInit {
  private shopServiceGrpc: ShopServiceGrpc;
  private productServiceGrpc: ProductServiceGrpc;

  constructor(
    @Inject('SHOP_SERVICE') private readonly client: ClientGrpc,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.shopServiceGrpc = this.client.getService<ShopServiceGrpc>('ShopService');
    this.productServiceGrpc = this.productClient.getService<ProductServiceGrpc>('ProductService');
  }

  @Post('')
  async createShop(@Body() shop: Partial<Shop>, @GetUser() user: User) {
    return firstValueFrom(this.shopServiceGrpc.createShop({ shop, user }));
  }

  @Post(':shopId/product')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'Product'))
  async createProduct(
    @Param('shopId') shopId: UUID,
    @Body() data: Partial<Product>,
    @GetUser() user: User
  ) {
    return firstValueFrom(this.productServiceGrpc.createProduct({ product: data, user, shopId }));
  }

  @Post(':shopId/category')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'Category'))
  async createCategory(
    @Param('shopId') shopId: UUID,
    @Body() category: Partial<Category>,
    @GetUser() user: User
  ) {
    return firstValueFrom(this.productServiceGrpc.createCategory({ category: { ...category, shopId }, user }));
  }
}

@Controller('product')
@UseGuards(JwtAuthGuard, ShopPoliciesGuard)
export class ProductController implements OnModuleInit {
  private productServiceGrpc: ProductServiceGrpc;

  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.productServiceGrpc = this.productClient.getService<ProductServiceGrpc>('ProductService');
  }

  @Post('category')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'SuperCategory'))
  async adminCreateCategory(@Body() category: { name: string }) {
    return firstValueFrom(this.productServiceGrpc.adminCreateCategory(category));
  }
}


