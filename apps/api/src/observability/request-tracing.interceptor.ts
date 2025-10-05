import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { SpanStatusCode } from '@opentelemetry/api';
import { TracingService } from './tracing.service';

@Injectable()
export class RequestTracingInterceptor implements NestInterceptor {
  constructor(private readonly tracing: TracingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();
    const response = httpContext.getResponse<FastifyReply>();

    const routeTemplate = request.routeOptions?.url ?? request.url;
    const spanName = `${request.method} ${routeTemplate}`;
    const span = this.tracing.startHttpSpan(spanName);
    span.setAttributes({
      'http.method': request.method,
      'http.route': routeTemplate,
      'http.url': request.url,
    });

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        span.setStatus({ code: SpanStatusCode.OK });
      }),
      catchError((error) => {
        this.tracing.setError(span, error);
        throw error;
      }),
      finalize(() => {
        const duration = Date.now() - start;
        span.setAttributes({ 'http.status_code': response.statusCode, 'http.duration_ms': duration });
        span.end();
      }),
    );
  }
}
