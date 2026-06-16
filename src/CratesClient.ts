import type { CratesSearchParams, CratesSearchResult } from './domain/Search';
import { CratesApiError } from './errors/CratesApiError';
import { CrateResource } from './resources/CrateResource';

const DEFAULT_BASE_URL = 'https://crates.io';
const DEFAULT_USER_AGENT =
  'crates-api-client/0.0.1 (https://github.com/ElJijuna/crates-api-client)';

/** Metadata emitted after each HTTP request. */
export interface RequestEvent {
  /** Full URL requested. */
  url: string;
  /** HTTP method used by this client. */
  method: 'GET';
  /** Time when the request started. */
  startedAt: Date;
  /** Time when the request finished or failed. */
  finishedAt: Date;
  /** Request duration in milliseconds. */
  durationMs: number;
  /** HTTP status code when a response was received. */
  statusCode?: number;
  /** Error thrown by fetch or by non-2xx response handling. */
  error?: Error;
}

/** Event callbacks supported by {@link CratesClient.on}. */
export interface CratesClientEvents {
  /** Fired once for every request, including failed and aborted requests. */
  request: (event: RequestEvent) => void;
}

/** Options for creating a {@link CratesClient}. */
export interface CratesClientOptions {
  /** Base URL for crates.io-compatible API endpoints. Defaults to `https://crates.io`. */
  baseUrl?: string;
  /**
   * User-Agent sent from Node.js requests.
   *
   * crates.io requires API clients to identify themselves. Browsers manage this header themselves.
   */
  userAgent?: string;
}

/** TypeScript client for the public crates.io REST API. */
export class CratesClient {
  private readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly listeners: Map<
    keyof CratesClientEvents,
    CratesClientEvents[keyof CratesClientEvents][]
  > = new Map();

  /** Create a client for crates.io or a compatible registry API. */
  constructor(options: CratesClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  }

  /** Subscribe to request lifecycle events. */
  on<K extends keyof CratesClientEvents>(event: K, callback: CratesClientEvents[K]): this {
    const cbs = this.listeners.get(event) ?? [];
    cbs.push(callback);
    this.listeners.set(event, cbs);
    return this;
  }

  private emit<K extends keyof CratesClientEvents>(
    event: K,
    payload: Parameters<CratesClientEvents[K]>[0],
  ): void {
    const cbs = this.listeners.get(event) ?? [];
    for (const cb of cbs) {
      (cb as (p: typeof payload) => void)(payload);
    }
  }

  /** @internal */
  private async request<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ): Promise<T> {
    const url = buildUrl(`${this.baseUrl}${path}`, params);
    const startedAt = new Date();
    let statusCode: number | undefined;

    try {
      const response = await fetch(url, {
        headers: this.buildHeaders(),
        signal,
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new CratesApiError(response.status, response.statusText);
      }
      const data = (await response.json()) as T;
      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt.getTime(),
        statusCode,
      });
      return data;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        error: err instanceof Error ? err : new Error(String(err)),
      });
      throw err;
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers = { Accept: 'application/json' };

    if (typeof window === 'undefined') {
      return { ...headers, 'User-Agent': this.userAgent };
    }

    return headers;
  }

  /** Get operations scoped to one crate name. */
  crate(name: string): CrateResource {
    return new CrateResource(
      <T>(path: string, params?: Record<string, string | number | boolean>, signal?: AbortSignal) =>
        this.request<T>(path, params, signal),
      name,
    );
  }

  /** Search crates by text, pagination, and crates.io sort order. */
  async search(params: CratesSearchParams = {}, signal?: AbortSignal): Promise<CratesSearchResult> {
    return this.request<CratesSearchResult>(
      '/api/v1/crates',
      {
        q: params.query ?? '',
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
        ...(params.sort !== undefined && { sort: params.sort }),
      },
      signal,
    );
  }
}

function buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
  if (!params) {
    return base;
  }
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    return base;
  }
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `${base}?${search.toString()}`;
}
