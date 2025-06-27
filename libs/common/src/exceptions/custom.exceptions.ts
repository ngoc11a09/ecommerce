import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
    constructor(message: string, key?: string) {
        super(
            {
                statusCode: HttpStatus.BAD_REQUEST,
                message: {
                    key: key || 'BAD_REQUEST',
                    message: message
                },
                error: 'Bad Request',
            },
            HttpStatus.BAD_REQUEST
        );
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string, key?: string) {
        super(
            {
                statusCode: HttpStatus.NOT_FOUND,
                message: {
                    key: key || 'NOT_FOUND',
                    message: message
                },
                error: 'Not Found',
            },
            HttpStatus.NOT_FOUND
        );
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string, key?: string) {
        super(
            {
                statusCode: HttpStatus.UNAUTHORIZED,
                message: {
                    key: key || 'UNAUTHORIZED',
                    message: message
                },
                error: 'Unauthorized',
            },
            HttpStatus.UNAUTHORIZED
        );
    }
}

export class ForbiddenException extends HttpException {
    constructor(message: string, key?: string) {
        super(
            {
                statusCode: HttpStatus.FORBIDDEN,
                message: {
                    key: key || 'FORBIDDEN',
                    message: message
                },
                error: 'Forbidden',
            },
            HttpStatus.FORBIDDEN
        );
    }
}