import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = {
            key: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error'
        };
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                if ((exceptionResponse as any).message && typeof (exceptionResponse as any).message === 'object') {
                    message = (exceptionResponse as any).message;
                } else if ((exceptionResponse as any).key && (exceptionResponse as any).message) {
                    message = {
                        key: (exceptionResponse as any).key,
                        message: (exceptionResponse as any).message
                    };
                } else {
                    message = {
                        key: this.getErrorKey(status),
                        message: (exceptionResponse as any).message || exception.message || 'Unknown error'
                    };
                }
                error = (exceptionResponse as any).error || exception.message;
            } else {
                message = {
                    key: this.getErrorKey(status),
                    message: exceptionResponse as string
                };
                error = exception.message;
            }
        } else if (exception instanceof Error && (exception as any).isGrpcError) {
            const grpcError = exception as any;
            status = this.mapGrpcToHttpStatus(grpcError.grpcCode);
            message = {
                key: this.getGrpcErrorKey(grpcError.grpcCode),
                message: grpcError.grpcMessage
            };
            error = this.getErrorType(grpcError.grpcCode);
        } else if (exception instanceof Error) {
            const grpcErrorInfo = this.parseGrpcErrorMessage(exception.message);
            console.log({ grpcErrorInfo });

            if (grpcErrorInfo) {
                status = this.mapGrpcToHttpStatus(grpcErrorInfo.code);

                if (grpcErrorInfo.message === '[object Object]') {
                    console.log('Detected [object Object], using default message');
                    message = {
                        key: this.getGrpcErrorKey(grpcErrorInfo.code),
                        message: 'An error occurred'
                    };
                } else if (typeof grpcErrorInfo.message === 'string') {
                    try {
                        const parsedMessage = JSON.parse(grpcErrorInfo.message);
                        if (typeof parsedMessage === 'object' && parsedMessage.key && parsedMessage.message) {
                            message = {
                                key: parsedMessage.key,
                                message: parsedMessage.message
                            };
                        } else {
                            message = {
                                key: this.getGrpcErrorKey(grpcErrorInfo.code),
                                message: JSON.stringify(parsedMessage)
                            };
                        }
                    } catch (e) {
                        message = {
                            key: this.getGrpcErrorKey(grpcErrorInfo.code),
                            message: grpcErrorInfo.message
                        };
                    }
                } else {
                    message = {
                        key: this.getGrpcErrorKey(grpcErrorInfo.code),
                        message: String(grpcErrorInfo.message)
                    };
                }
                error = this.getErrorType(grpcErrorInfo.code);
            } else {
                message = {
                    key: 'UNKNOWN_ERROR',
                    message: exception.message
                };
                error = exception.name;
            }
        }

        this.logger.warn(
            `Exception occurred: ${message.message}`,
            exception instanceof Error ? exception.stack : 'Unknown error',
            {
                path: request.url,
                method: request.method,
                timestamp: new Date().toISOString(),
                status,
            }
        );

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            error,
        };

        response.status(status).json(errorResponse);
    }

    private getErrorKey(httpStatus: number): string {
        const keyMap = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            500: 'INTERNAL_SERVER_ERROR',
        };

        return keyMap[httpStatus] || 'UNKNOWN_ERROR';
    }

    private getGrpcErrorKey(grpcCode: number): string {
        const keyMap = {
            1: 'CANCELLED',
            2: 'UNKNOWN',
            3: 'INVALID_ARGUMENT',
            4: 'DEADLINE_EXCEEDED',
            5: 'NOT_FOUND',
            6: 'ALREADY_EXISTS',
            7: 'PERMISSION_DENIED',
            8: 'RESOURCE_EXHAUSTED',
            9: 'FAILED_PRECONDITION',
            10: 'ABORTED',
            11: 'OUT_OF_RANGE',
            12: 'UNIMPLEMENTED',
            13: 'INTERNAL',
            14: 'UNAVAILABLE',
            15: 'DATA_LOSS',
            16: 'UNAUTHENTICATED',
        };

        return keyMap[grpcCode] || 'UNKNOWN_ERROR';
    }

    private parseGrpcErrorMessage(errorMessage: string): { code: number; message: string } | null {
        const match = errorMessage.match(/^(\d+)\s+([A-Z_]+):\s*(.+)$/);

        if (match) {
            const code = parseInt(match[1], 10);
            const message = match[3];
            return { code, message };
        }

        return null;
    }

    private mapGrpcToHttpStatus(grpcCode: number): number {
        const statusMap = {
            1: 500,   // CANCELLED
            2: 500,   // UNKNOWN
            3: 400,   // INVALID_ARGUMENT
            4: 408,   // DEADLINE_EXCEEDED
            5: 404,   // NOT_FOUND
            6: 409,   // ALREADY_EXISTS
            7: 403,   // PERMISSION_DENIED
            8: 429,   // RESOURCE_EXHAUSTED
            9: 400,   // FAILED_PRECONDITION
            10: 409,  // ABORTED
            11: 400,  // OUT_OF_RANGE
            12: 501,  // UNIMPLEMENTED
            13: 500,  // INTERNAL
            14: 503,  // UNAVAILABLE
            15: 500,  // DATA_LOSS
            16: 401,  // UNAUTHENTICATED
        };

        return statusMap[grpcCode] || 500;
    }

    private getErrorType(grpcCode: number): string {
        const errorMap = {
            3: 'Bad Request',
            5: 'Not Found',
            6: 'Conflict',
            7: 'Forbidden',
            13: 'Internal Server Error',
            16: 'Unauthorized',
        };

        return errorMap[grpcCode] || 'Internal Server Error';
    }
}