import type {
  CrateResult,
  CrateVersion,
  CrateVersionResult,
  CrateVersionsResult,
} from '../domain/Crate';
import type { RequestFn } from './types';

/** Operations for metadata and versions of a single crate. */
export class CrateResource {
  private readonly name: string;
  private readonly request: RequestFn;

  /** @internal */
  constructor(request: RequestFn, name: string) {
    this.request = request;
    this.name = name;
  }

  /** Fetch crate metadata plus included versions, keywords, and categories. */
  async summary(signal?: AbortSignal): Promise<CrateResult> {
    return this.request<CrateResult>(
      `/api/v1/crates/${encodeURIComponent(this.name)}`,
      undefined,
      signal,
    );
  }

  /** Fetch all versions published for this crate. */
  async versions(signal?: AbortSignal): Promise<CrateVersion[]> {
    const data = await this.request<CrateVersionsResult>(
      `/api/v1/crates/${encodeURIComponent(this.name)}/versions`,
      undefined,
      signal,
    );
    return data.versions;
  }

  /** Fetch metadata for a specific crate version. */
  async version(version: string, signal?: AbortSignal): Promise<CrateVersion> {
    const data = await this.request<CrateVersionResult>(
      `/api/v1/crates/${encodeURIComponent(this.name)}/${encodeURIComponent(version)}`,
      undefined,
      signal,
    );
    return data.version;
  }

  /** Fetch version metadata matching the crate `max_version`. */
  async latest(signal?: AbortSignal): Promise<CrateVersion> {
    const data = await this.summary(signal);
    const latest = data.versions.find((version) => version.num === data.crate.max_version);
    if (!latest) {
      throw new Error(`No latest version found for ${this.name}`);
    }
    return latest;
  }
}
