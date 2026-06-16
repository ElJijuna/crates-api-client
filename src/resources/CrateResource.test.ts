import { CratesApiError, CratesClient } from '../index';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse<T>(data: T, status = 200): void {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    json: () => Promise.resolve(data),
  });
}

const version1 = {
  id: 1,
  crate: 'serde',
  num: '1.0.0',
  dl_path: '/api/v1/crates/serde/1.0.0/download',
  readme_path: '/api/v1/crates/serde/1.0.0/readme',
  updated_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  downloads: 100,
  features: {},
  yanked: false,
  license: 'MIT OR Apache-2.0',
  links: {
    dependencies: '/api/v1/crates/serde/1.0.0/dependencies',
    version_downloads: '/api/v1/crates/serde/1.0.0/downloads',
    authors: '/api/v1/crates/serde/1.0.0/authors',
  },
  crate_size: 1000,
  published_by: null,
  audit_actions: [],
  checksum: 'abc',
  rust_version: null,
  has_lib: true,
  bin_names: [],
  edition: '2021',
  description: null,
  homepage: null,
  documentation: null,
  repository: null,
  trustpub_data: null,
  linecounts: null,
};

const version2 = { ...version1, id: 2, num: '1.1.0', downloads: 200 };

const crateFixture = {
  crate: {
    id: 'serde',
    name: 'serde',
    updated_at: '2024-01-01T00:00:00Z',
    versions: [1, 2],
    keywords: ['serialization'],
    categories: ['encoding'],
    badges: [],
    created_at: '2014-12-01T00:00:00Z',
    downloads: 1000,
    recent_downloads: 100,
    max_version: '1.1.0',
    newest_version: '1.1.0',
    max_stable_version: '1.1.0',
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
  versions: [version1, version2],
  keywords: [],
  categories: [],
};

describe('CrateResource', () => {
  let crates: CratesClient;

  beforeEach(() => {
    mockFetch.mockClear();
    crates = new CratesClient();
  });

  describe('summary()', () => {
    it('fetches crate metadata by crate name', async () => {
      mockResponse(crateFixture);
      await crates.crate('serde').summary();
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/api/v1/crates/serde');
    });

    it('returns crate metadata and included versions', async () => {
      mockResponse(crateFixture);
      const result = await crates.crate('serde').summary();
      expect(result.crate.name).toBe('serde');
      expect(result.versions.map((version) => version.num)).toEqual(['1.0.0', '1.1.0']);
    });

    it('throws CratesApiError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn(),
      });
      await expect(crates.crate('missing').summary()).rejects.toThrow(CratesApiError);
    });
  });

  describe('versions()', () => {
    it('fetches versions endpoint', async () => {
      mockResponse({ versions: [version1, version2] });
      await crates.crate('serde').versions();
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/api/v1/crates/serde/versions');
    });

    it('returns array of versions', async () => {
      mockResponse({ versions: [version1, version2] });
      const versions = await crates.crate('serde').versions();
      expect(versions.map((version) => version.num)).toEqual(['1.0.0', '1.1.0']);
    });

    it('passes AbortSignal to fetch', async () => {
      mockResponse({ versions: [version1] });
      const controller = new AbortController();
      await crates.crate('serde').versions(controller.signal);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });

  describe('version(version)', () => {
    it('returns specific version metadata', async () => {
      mockResponse({ version: version2 });
      const version = await crates.crate('serde').version('1.1.0');
      expect(version.num).toBe('1.1.0');
      expect(version.crate).toBe('serde');
    });

    it('fetches encoded crate name and version', async () => {
      mockResponse({ version: version2 });
      await crates.crate('serde_json').version('1.1.0+meta');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/api/v1/crates/serde_json/1.1.0%2Bmeta');
    });

    it('passes AbortSignal to fetch', async () => {
      mockResponse({ version: version1 });
      const controller = new AbortController();
      await crates.crate('serde').version('1.0.0', controller.signal);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });

  describe('latest()', () => {
    it('returns the version matching crate.max_version', async () => {
      mockResponse(crateFixture);
      const latest = await crates.crate('serde').latest();
      expect(latest.num).toBe('1.1.0');
    });

    it('throws when max_version is not included', async () => {
      mockResponse({
        ...crateFixture,
        crate: { ...crateFixture.crate, max_version: '9.9.9' },
      });
      await expect(crates.crate('serde').latest()).rejects.toThrow('No latest version found');
    });

    it('passes AbortSignal to fetch', async () => {
      mockResponse(crateFixture);
      const controller = new AbortController();
      await crates.crate('serde').latest(controller.signal);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });
});
