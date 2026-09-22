import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'An unexpected internal error occurred';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || exception.message;
      errorType = exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.name;
    }

    if (status === HttpStatus.NOT_FOUND) {
      this.logger.warn(
        `HTTP 404 [${request.method}] ${request.url} - ${Array.isArray(message) ? message.join(', ') : message}`,
      );
    } else {
      this.logger.error(
        `HTTP ${status} [${request.method}] ${request.url} - ${Array.isArray(message) ? message.join(', ') : message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const isApiRequest =
      request.url.startsWith('/api') ||
      (request.headers.accept && request.headers.accept.includes('application/json'));

    if (isApiRequest) {
      response.status(status).json({
        statusCode: status,
        error: errorType,
        message: message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    } else {
      response.status(status).render('error', {
        statusCode: status,
        title: errorType,
        message: Array.isArray(message) ? message.join(', ') : message,
        path: request.url,
      });
    }
  }
}
