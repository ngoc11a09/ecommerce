import { ShopMemberRole } from '@app/common';
import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShopMemberGuard implements CanActivate {
    private shopServiceGrpc: any;

    constructor(@Inject('SHOP_SERVICE') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.shopServiceGrpc = this.client.getService('ShopService');
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const shopId = req.params.shopId || req.body.shopId || req.query.shopId;

        if (user && shopId) {
            try {
                const { role } = await firstValueFrom<{ role: ShopMemberRole }>(
                    this.shopServiceGrpc.getShopMemberRole({ userId: user.id, shopId })
                );

                if (role === ShopMemberRole.OWNER || role === ShopMemberRole.OPERATOR || role === ShopMemberRole.STAFF) {
                    req.shopMemberRole = role;
                    return true;
                }
                return false;
            } catch (e) {
                console.log(e);
                return false;
            }
        }
        return false;
    }
}