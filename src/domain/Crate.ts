import type { CrateSummary } from './Search';

export interface CrateVersion {
  id: number;
  crate: string;
  num: string;
  dl_path: string;
  readme_path: string;
  updated_at: string;
  created_at: string;
  downloads: number;
  features: Record<string, string[]>;
  yanked: boolean;
  license: string | null;
  links: {
    dependencies: string;
    version_downloads: string;
    authors: string;
  };
  crate_size: number | null;
  published_by: unknown | null;
  audit_actions: unknown[];
  checksum: string;
  rust_version: string | null;
  has_lib: boolean;
  bin_names: string[];
  edition: string | null;
  description: string | null;
  homepage: string | null;
  documentation: string | null;
  repository: string | null;
  trustpub_data: unknown | null;
  linecounts: unknown | null;
}

export interface CrateVersionsResult {
  versions: CrateVersion[];
  meta?: {
    total: number;
  };
}

export interface CrateResult {
  crate: CrateSummary;
  versions: CrateVersion[];
  keywords: unknown[];
  categories: unknown[];
}

export interface CrateVersionResult {
  version: CrateVersion;
}
