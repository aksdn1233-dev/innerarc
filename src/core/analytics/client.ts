import { SafeAnalyticsEventSchema, type SafeAnalyticsEvent } from "./events";

export type AnalyticsWriteResult = Readonly<{ duplicate: boolean }>;

export interface AnalyticsSink {
  write(event: SafeAnalyticsEvent): Promise<AnalyticsWriteResult>;
}

export type AnalyticsCaptureResult = Readonly<{
  accepted: boolean;
  reason: "recorded" | "duplicate" | "consent_required" | "sink_disabled";
}>;

export class DisabledAnalyticsSink implements AnalyticsSink {
  async write(): Promise<AnalyticsWriteResult> {
    throw new Error("ANALYTICS_SINK_DISABLED");
  }
}

export class InMemoryAnalyticsSink implements AnalyticsSink {
  readonly #events = new Map<string, SafeAnalyticsEvent>();

  async write(candidate: SafeAnalyticsEvent): Promise<AnalyticsWriteResult> {
    const event = SafeAnalyticsEventSchema.parse(candidate);
    if (this.#events.has(event.eventId)) return { duplicate: true };
    this.#events.set(event.eventId, event);
    return { duplicate: false };
  }

  list(): readonly SafeAnalyticsEvent[] {
    return [...this.#events.values()];
  }
}

export class ConsentGatedAnalytics {
  constructor(
    private readonly sink: AnalyticsSink | null,
    private readonly hasProductAnalyticsConsent: () => boolean,
  ) {}

  async capture(candidate: unknown): Promise<AnalyticsCaptureResult> {
    if (!this.hasProductAnalyticsConsent()) return { accepted: false, reason: "consent_required" };
    const event = SafeAnalyticsEventSchema.parse(candidate);
    if (!this.sink) return { accepted: false, reason: "sink_disabled" };
    const result = await this.sink.write(event);
    return { accepted: !result.duplicate, reason: result.duplicate ? "duplicate" : "recorded" };
  }
}
