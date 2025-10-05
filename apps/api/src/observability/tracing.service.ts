import { Injectable } from '@nestjs/common';
import { context, SpanKind, SpanStatusCode, trace, Tracer } from '@opentelemetry/api';

@Injectable()
export class TracingService {
  private readonly tracer: Tracer;

  constructor() {
    this.tracer = trace.getTracer('agencyos.api', '0.1.0');
  }

  getTracer(): Tracer {
    return this.tracer;
  }

  getActiveContext() {
    return context.active();
  }

  startHttpSpan(name: string) {
    return this.tracer.startSpan(name, {
      kind: SpanKind.SERVER,
    }, this.getActiveContext());
  }

  setError(span: ReturnType<Tracer['startSpan']>, error: unknown) {
    if (!span) {
      return;
    }

    if (error instanceof Error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    } else {
      span.setStatus({ code: SpanStatusCode.ERROR });
    }
  }
}
