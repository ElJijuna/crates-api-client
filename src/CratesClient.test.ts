import { CratesApiError, CratesClient } from './index';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse<T>(data: T, status = 200): void {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  });
}

const searchFixture = {
  crates: [
    {
      id: 'serde',
      name: 'serde',
      updated_at: '2024-01-01T00:00:00Z',
      versions: [1],
      keywords: ['serialization'],
      categories: ['encoding'],
      badges: [],
      created_at: '2014-12-01T00:00:00Z',
      downloads: 1000,
      recent_downloads: 100,
      max_version: '1.0.0',
      newest_version: '1.0.0',
      max_stable_version: '1.0.0',
      description: 'Serialization framework',
      homepage: null,
      documentation: 'https://docs.rs/serde',
      repository: 'https://github.com/serde-rs/serde',
      links: {
        version_downloads: '/api/v1/crates/serde/downloads',
        versions: '/api/v1/crates/serde/versions',
        owners: '/api/v1/crates/serde/owners',
        owner_team: '/api/v1/crates/serde/owner_team',
        owner_user: '/api/v1/crates/serde/owner_user',
        reverse_dependencies: '/api/v1/crates/serde/reverse_dependencies',
      },
      exact_match: true,
    },
  ],
  meta: { total: 1 },
};

describe('CratesClient', () => {
  let crates: CratesClient;

  beforeEach(() => {
    mockFetch.mockClear();
    crates = new CratesClient();
  });

  describe('constructor', () => {
    it('constructs with defaults', () => {
      expect(new CratesClient()).toBeInstanceOf(CratesClient);
    });

    it('accepts custom baseUrl', () => {
      expect(new CratesClient({ baseUrl: 'https://my-registry.example.com' })).toBeInstanceOf(
        CratesClient,
      );
    });

    it('strips trailing slash from baseUrl', async () => {
      const client = new CratesClient({ baseUrl: 'https://crates.io/' });
      mockResponse(searchFixture);
      await client.search({ query: 'serde' });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toMatch(/^https:\/\/crates\.io\/api\/v1\/crates/);
    });
  });

  describe('crate()', () => {
    it('returns an object with summary, versions, version, and latest methods', () => {
      const crate = crates.crate('serde');
      expect(crate).toBeDefined();
      expect(typeof crate.summary).toBe('function');
      expect(typeof crate.versions).toBe('function');
      expect(typeof crate.version).toBe('function');
      expect(typeof crate.latest).toBe('function');
    });
  });

  describe('search()', () => {
    it('calls /api/v1/crates', async () => {
      mockResponse(searchFixture);
      await crates.search({ query: 'serde' });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/api/v1/crates');
    });

    it('includes q param', async () => {
      mockResponse(searchFixture);
      await crates.search({ query: 'serde json' });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('q=serde+json');
    });

    it('includes pagination params when provided', async () => {
      mockResponse(searchFixture);
      await crates.search({ query: 'serde', page: 2, perPage: 25 });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('page=2');
      expect(url).toContain('per_page=25');
    });

    it('defaults page to 1 and per_page to 10 when omitted', async () => {
      mockResponse(searchFixture);
      await crates.search({});
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('page=1');
      expect(url).toContain('per_page=10');
    });

    it('includes sort when provided', async () => {
      mockResponse(searchFixture);
      await crates.search({ query: 'serde', sort: 'downloads' });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('sort=downloads');
    });

    it('returns the full search result', async () => {
      mockResponse(searchFixture);
      const result = await crates.search({ query: 'serde' });
      expect(result.meta.total).toBe(1);
      expect(result.crates[0].name).toBe('serde');
    });

    it('throws CratesApiError on non-2xx', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn(),
      });
      await expect(crates.search({ query: 'serde' })).rejects.toThrow(CratesApiError);
    });

    it('passes signal to fetch', async () => {
      mockResponse(searchFixture);
      const controller = new AbortController();
      await crates.search({ query: 'serde' }, controller.signal);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });

  describe('on() event emitter', () => {
    it('emits request event on success', async () => {
      mockResponse(searchFixture);
      const events: unknown[] = [];
      crates.on('request', (e) => events.push(e));
      await crates.search({ query: 'serde' });
      expect(events).toHaveLength(1);
      const event = events[0] as { method: string; statusCode: number };
      expect(event.method).toBe('GET');
      expect(event.statusCode).toBe(200);
    });

    it('emits request event with error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn(),
      });
      const events: unknown[] = [];
      crates.on('request', (e) => events.push(e));
      await expect(crates.search({ query: 'missing' })).rejects.toThrow(CratesApiError);
      const event = events[0] as { error: Error };
      expect(event.error).toBeInstanceOf(CratesApiError);
    });

    it('supports method chaining', () => {
      expect(crates.on('request', () => undefined)).toBe(crates);
    });

    it('calls multiple listeners in registration order', async () => {
      mockResponse(searchFixture);
      const calls: number[] = [];
      crates
        .on('request', () => calls.push(1))
        .on('request', () => calls.push(2))
        .on('request', () => calls.push(3));
      await crates.search({ query: 'serde' });
      expect(calls).toEqual([1, 2, 3]);
    });

    it('event includes url, startedAt, finishedAt, durationMs', async () => {
      mockResponse(searchFixture);
      const events: unknown[] = [];
      crates.on('request', (e) => events.push(e));
      await crates.search({ query: 'serde' });
      const e = events[0] as {
        url: string;
        startedAt: Date;
        finishedAt: Date;
        durationMs: number;
      };
      expect(typeof e.url).toBe('string');
      expect(e.startedAt).toBeInstanceOf(Date);
      expect(e.finishedAt).toBeInstanceOf(Date);
      expect(typeof e.durationMs).toBe('number');
    });

    it('propagates AbortError and emits request event', async () => {
      const abortError = new DOMException('The operation was aborted.', 'AbortError');
      mockFetch.mockRejectedValueOnce(abortError);
      const events: unknown[] = [];
      crates.on('request', (e) => events.push(e));
      const controller = new AbortController();
      await expect(crates.search({ query: 'serde' }, controller.signal)).rejects.toThrow(
        'The operation was aborted.',
      );
      expect(events).toHaveLength(1);
      const event = events[0] as { error: Error };
      expect(event.error.message).toContain('The operation was aborted.');
    });
  });

  describe('Accept header', () => {
    it('sends Accept: application/json header', async () => {
      mockResponse(searchFixture);
      await crates.search({ query: 'serde' });
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers.Accept).toBe('application/json');
    });

    it('sends a default User-Agent header for crates.io compatibility', async () => {
      mockResponse(searchFixture);
      await crates.search({ query: 'serde' });
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers['User-Agent']).toContain('crates-api-client');
    });

    it('accepts custom User-Agent header', async () => {
      const client = new CratesClient({ userAgent: 'my-tool/1.0 (me@example.com)' });
      mockResponse(searchFixture);
      await client.search({ query: 'serde' });
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers['User-Agent']).toBe('my-tool/1.0 (me@example.com)');
    });
  });
});
