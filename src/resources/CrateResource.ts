import type {
  CrateResult,
  CrateVersion,
  CrateVersionResult,
  CrateVersionsResult,
} from '../domain/Crate';
import type { RequestFn } from './types';

export class CrateResource {
  private readonly name: string;
  private readonly request: RequestFn;

  /** @internal */
  constructor(request: RequestFn, name: string) {
    this.request = request;
    this.name = name;
  }

  async summary(signal?: AbortSignal): Promise<CrateResult> {
    return this.request<CrateResult>(
      `/api/v1/crates/${encodeURIComponent(this.name)}`,
      undefined,
      signal,
    );
  }

  async versions(signal?: AbortSignal): Promise<CrateVersion[]> {
    const data = await this.request<CrateVersionsResult>(
      `/api/v1/crates/${encodeURIComponent(this.name)}/versions`,
      undefined,
      signal,
    );
    return data.versions;
  }

  async version(version: string, signal?: AbortSignal): Promise<CrateVersion> {
    const data = await this.request<CrateVersionResult>(
      `/api/v1/crates/${encodeURIComponent(this.name)}/${encodeURIComponent(version)}`,
      undefined,
      signal,
    );
    return data.version;
  }

  async latest(signal?: AbortSignal): Promise<CrateVersion> {
    const data = await this.summary(signal);
    const latest = data.versions.find((version) => version.num === data.crate.max_version);
    if (!latest) {
      throw new Error(`No latest version found for ${this.name}`);
    }
    return latest;
  }
}
