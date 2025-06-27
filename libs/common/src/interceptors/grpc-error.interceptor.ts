import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class GrpcErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError(error => {

                if (error instanceof HttpException) {

                    const response = error.getResponse();
                    const errStatus = error.getStatus();
                    const grpcStatus = this.mapHttpToGrpcStatus(errStatus);

                    let messageString: string;

                    if (typeof response === 'object' && (response as any).message) {
                        const message = (response as any).message;

                        if (typeof message === 'object' && message !== null) {
                            messageString = JSON.stringify(message);
                        } else {
                            messageString = String(message);
                        }
                    } else {
                        messageString = typeof response === 'object' ? (response as any).message : String(response);
                    }

                    return throwError(() => new RpcException({
                        code: grpcStatus,
                        message: messageString,
                        details: {
                            httpStatus: errStatus,
                            httpError: typeof response === 'object' ? (response as any).error : 'Unknown',
                            timestamp: new Date().toISOString(),
                            service: context.getClass().name
                        }
                    }));
                }

                return throwError(() => new RpcException({
                    code: status.INTERNAL,
                    message: error.message || 'Internal server error',
                    details: {
                        originalError: error.constructor.name,
                        timestamp: new Date().toISOString(),
                        service: context.getClass().name
                    }
                }));
            })
        );
    }

    private mapHttpToGrpcStatus(httpStatus: number): number {
        const statusMap = {
            400: status.INVALID_ARGUMENT,
            401: status.UNAUTHENTICATED,
            403: status.PERMISSION_DENIED,
            404: status.NOT_FOUND,
            409: status.ALREADY_EXISTS,
            422: status.INVALID_ARGUMENT,
            500: status.INTERNAL,
        };

        return statusMap[httpStatus] || status.INTERNAL;
    }

    private getGrpcStatusName(code: number): string {
        const statusNames = {
            [status.INVALID_ARGUMENT]: 'INVALID_ARGUMENT',
            [status.UNAUTHENTICATED]: 'UNAUTHENTICATED',
            [status.PERMISSION_DENIED]: 'PERMISSION_DENIED',
            [status.NOT_FOUND]: 'NOT_FOUND',
            [status.ALREADY_EXISTS]: 'ALREADY_EXISTS',
            [status.INTERNAL]: 'INTERNAL',
        };

        return statusNames[code] || 'UNKNOWN';
    }
}