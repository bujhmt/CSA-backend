import {
    ExceptionFilter, Catch, ArgumentsHost, BadRequestException, Logger,
} from '@nestjs/common';
import {Request, Response} from 'express';

@Catch(BadRequestException)
export class RequestValidationFilter implements ExceptionFilter {
    private readonly logger = new Logger(RequestValidationFilter.name);

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const exceptionResponse: {message?: string[]} | undefined = exception?.getResponse() as Record<string, any>;

        this.logger.error(`Data exception on: ${request.url}
                                  \nException message: ${exception.message},
                                  \nData received: ${JSON.stringify(request.body || request.query, null, 4)},
                                  \nException Response ${JSON.stringify(exceptionResponse, null, 4)}`);

        response.json({
            statusCode: status,
            message: 'Bad data',
        });
    }
}
