# crates-api-client

[![npm version](https://img.shields.io/npm/v/crates-api-client)](https://www.npmjs.com/package/crates-api-client)
[![npm downloads](https://img.shields.io/npm/dm/crates-api-client)](https://www.npmjs.com/package/crates-api-client)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/crates-api-client)](https://bundlephobia.com/package/crates-api-client)
[![CI](https://github.com/ElJijuna/crates-api-client/actions/workflows/ci.yml/badge.svg)](https://github.com/ElJijuna/crates-api-client/actions/workflows/ci.yml)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/node/v/crates-api-client)](https://nodejs.org/)

TypeScript client for the [crates.io REST API](https://crates.io/). Covers crate metadata, versions, version metadata, and search. Works in **Node.js** and the **browser** (isomorphic). Fully typed, zero runtime dependencies.

**Data source:**

| Source | What it provides |
| --- | --- |
| [crates.io](https://crates.io) | Search, crate metadata, and version metadata via `/api/v1` |

---

## Installation

```bash
npm install crates-api-client
```

---

## Quick start

```typescript
import { CratesClient } from 'crates-api-client';

// Public API, no auth required
const crates = new CratesClient();

// Custom registry-compatible endpoint
const privateRegistry = new CratesClient({
  baseUrl: 'https://my-registry.example.com',
  userAgent: 'my-tool/1.0 (me@example.com)',
});
```

`crates.io` requires API clients to send a descriptive `User-Agent`. Node.js requests send `crates-api-client/0.0.1 (https://github.com/ElJijuna/crates-api-client)` by default. Browsers manage this header themselves.

---

## API reference

### Crate metadata

```typescript
const serde = await crates.crate('serde').summary();

console.log(serde.crate.name);        // 'serde'
console.log(serde.crate.max_version); // '1.0.228'
console.log(serde.crate.downloads);   // total downloads

serde.versions.forEach(version => {
  console.log(version.num);     // '1.0.228'
  console.log(version.yanked);  // false
  console.log(version.edition); // '2021'
});
```

### Crate versions

```typescript
// All published versions
const versions = await crates.crate('serde').versions();
console.log(versions.map(version => version.num));

// Latest version by crate.max_version
const latest = await crates.crate('serde').latest();
console.log(latest.num);

// Specific version metadata
const v1 = await crates.crate('serde').version('1.0.0');
console.log(v1.license);    // 'MIT OR Apache-2.0'
console.log(v1.downloads);  // version downloads
console.log(v1.features);   // Cargo features
```

### Search

```typescript
const results = await crates.search({ query: 'serde', perPage: 10 });

console.log(results.meta.total); // total matching crates

results.crates.forEach(crate => {
  console.log(crate.name);        // 'serde'
  console.log(crate.max_version); // latest semver string
  console.log(crate.downloads);   // total downloads
});

// Paginate and sort
const page2 = await crates.search({
  query: 'json',
  page: 2,
  perPage: 25,
  sort: 'downloads',
});
```

| Parameter | Type | Description |
| --- | --- | --- |
| `query` | `string` | Search text (optional, empty by default) |
| `page` | `number` | Page number (default: 1) |
| `perPage` | `number` | Results per page (default: 10) |
| `sort` | `'alpha' \| 'downloads' \| 'recent-downloads' \| 'recent-updates' \| 'new'` | crates.io sort mode |

---

## Cancelling requests

Pass an `AbortSignal` to any method to cancel the in-flight request:

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

await crates.crate('serde').summary(controller.signal);
await crates.crate('serde').versions(controller.signal);
await crates.crate('serde').latest(controller.signal);
await crates.crate('serde').version('1.0.0', controller.signal);
await crates.search({ query: 'serde' }, controller.signal);
```

When aborted, `fetch` throws a `DOMException` with `name === 'AbortError'`. The `request` event is still emitted with the error attached.

---

## Request events

Subscribe to every HTTP request for logging, monitoring, or debugging:

```typescript
crates.on('request', (event) => {
  console.log(`[${event.statusCode}] ${event.method} ${event.url} (${event.durationMs}ms)`);
  if (event.error) {
    console.error('Request failed:', event.error.message);
  }
});
```

| Field | Type | Description |
| --- | --- | --- |
| `url` | `string` | Full URL requested |
| `method` | `'GET'` | HTTP method |
| `startedAt` | `Date` | When request started |
| `finishedAt` | `Date` | When request finished |
| `durationMs` | `number` | Duration in milliseconds |
| `statusCode` | `number \| undefined` | HTTP status code, if response was received |
| `error` | `Error \| undefined` | Present only if request failed |

`on()` is chainable and supports multiple listeners:

```typescript
crates
  .on('request', logToConsole)
  .on('request', sendToDatadog);
```

---

## Error handling

Non-2xx responses throw a `CratesApiError`:

```typescript
import { CratesApiError } from 'crates-api-client';

try {
  await crates.crate('not-a-real-crate').summary();
} catch (err) {
  if (err instanceof CratesApiError) {
    console.log(err.status);     // 404
    console.log(err.statusText); // 'Not Found'
    console.log(err.message);    // 'crates.io API error: 404 Not Found'
  }
}
```

---

## TypeScript types

All domain types are exported:

```typescript
import type {
  // Client
  CratesClientOptions,
  RequestEvent,
  CratesClientEvents,

  // Search
  CratesSearchParams,
  CratesSearchResult,
  CratesSort,
  CrateSummary,

  // Crate metadata and versions
  CrateResult,
  CrateVersion,
  CrateVersionResult,
  CrateVersionsResult,
} from 'crates-api-client';
```

---

## License

[MIT](LICENSE)
