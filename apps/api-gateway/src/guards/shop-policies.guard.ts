import { CanActivate, ExecutionContext, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyHandler } from '@app/common';
import { AppAbility, CaslAbilityFactory } from '@app/common';
import { CHECK_POLICIES_KEY } from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ShopMemberRole } from '@app/common';
import { UUID } from 'crypto';

interface ShopServiceGrpc {
    getShopMemberRole(data: { userId: UUID, shopId: UUID }): Observable<{ role: string }>;
}

@Injectable()
export class ShopPoliciesGuard implements OnModuleInit, CanActivate {
    private shopServiceGrpc: ShopServiceGrpc;

    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory,
        @Inject('SHOP_SERVICE') private readonly client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.shopServiceGrpc = this.client.getService<ShopServiceGrpc>('ShopService');
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const policyHandlers =
            this.reflector.get<PolicyHandler[]>(
                CHECK_POLICIES_KEY,
                context.getHandler(),
            ) || [];

        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const shopId = req.params.shopId || req.body.shopId || req.query.shopId;
        if (user && shopId) {
            const { role } = await firstValueFrom<{ role: string }>(
                this.shopServiceGrpc.getShopMemberRole({ userId: user.id, shopId })
            );
            user.shopMemberRole = role;
        } else {
            user.shopMemberRole = undefined;
        }

        const ability = this.caslAbilityFactory.createForUser(user) as AppAbility;

        return policyHandlers.every((handler) =>
            this.execPolicyHandler(handler, ability),
        );
    }

    private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
        if (typeof handler === 'function') {
            return handler(ability);
        }
        return handler.handle(ability);
    }
} 