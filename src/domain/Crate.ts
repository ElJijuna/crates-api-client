import type { CrateSummary } from './Search';

/** Version metadata returned by crates.io. */
export interface CrateVersion {
  /** crates.io numeric version ID. */
  id: number;
  /** Crate name this version belongs to. */
  crate: string;
  /** Semver version string. */
  num: string;
  /** Relative download endpoint for this version. */
  dl_path: string;
  /** Relative readme endpoint for this version. */
  readme_path: string;
  /** ISO timestamp when this version was last updated. */
  updated_at: string;
  /** ISO timestamp when this version was published. */
  created_at: string;
  /** Total downloads for this version. */
  downloads: number;
  /** Cargo feature map for this version. */
  features: Record<string, string[]>;
  /** Whether this version has been yanked. */
  yanked: boolean;
  /** License expression from Cargo.toml metadata. */
  license: string | null;
  /** Relative crates.io API links for version-related resources. */
  links: {
    /** Dependencies endpoint. */
    dependencies: string;
    /** Version downloads endpoint. */
    version_downloads: string;
    /** Authors endpoint. */
    authors: string;
  };
  /** Published crate archive size in bytes, when available. */
  crate_size: number | null;
  /** User metadata for publisher when crates.io includes it. */
  published_by: unknown | null;
  /** Audit action payloads returned by crates.io. */
  audit_actions: unknown[];
  /** Crate archive checksum. */
  checksum: string;
  /** Minimum supported Rust version declared by crate. */
  rust_version: string | null;
  /** Whether this version contains a library target. */
  has_lib: boolean;
  /** Binary target names included in this version. */
  bin_names: string[];
  /** Rust edition declared by this version. */
  edition: string | null;
  /** Version-specific description when provided. */
  description: string | null;
  /** Version-specific homepage when provided. */
  homepage: string | null;
  /** Version-specific documentation URL when provided. */
  documentation: string | null;
  /** Version-specific repository URL when provided. */
  repository: string | null;
  /** Trusted publishing metadata when provided by crates.io. */
  trustpub_data: unknown | null;
  /** Source line count metadata when provided by crates.io. */
  linecounts: unknown | null;
}

/** Response from crate versions endpoint. */
export interface CrateVersionsResult {
  /** Versions published for crate. */
  versions: CrateVersion[];
  /** Optional pagination metadata. */
  meta?: {
    /** Total versions available. */
    total: number;
  };
}

/** Response from crate detail endpoint. */
export interface CrateResult {
  /** Crate summary metadata. */
  crate: CrateSummary;
  /** Versions included in detail response. */
  versions: CrateVersion[];
  /** Keyword payloads included by crates.io. */
  keywords: unknown[];
  /** Category payloads included by crates.io. */
  categories: unknown[];
}

/** Response from specific version endpoint. */
export interface CrateVersionResult {
  /** Requested version metadata. */
  version: CrateVersion;
}
