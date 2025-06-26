import { User } from '@app/common';

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
        shopMemberRole?: string;
        shopId?: string;
    }
}