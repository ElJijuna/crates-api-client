/** Sort modes accepted by crates.io search. */
export type CratesSort = 'alpha' | 'downloads' | 'recent-downloads' | 'recent-updates' | 'new';

/** Parameters for crate search. */
export interface CratesSearchParams {
  /** Search text. Omit or pass empty string to list crates without a text filter. */
  query?: string;
  /** 1-based page number. Defaults to `1`. */
  page?: number;
  /** Results per page. Defaults to `10`. */
  perPage?: number;
  /** crates.io sort order. */
  sort?: CratesSort;
}

/** Summary metadata returned by crate search and crate detail endpoints. */
export interface CrateSummary {
  /** crates.io crate identifier. Usually same as `name`. */
  id: string;
  /** Published crate name. */
  name: string;
  /** ISO timestamp when crate metadata last changed. */
  updated_at: string;
  /** Version IDs included by crates.io for detail responses. */
  versions: number[] | null;
  /** Keyword slugs attached to crate. */
  keywords: string[];
  /** Category slugs attached to crate. */
  categories: string[];
  /** Badge payloads returned by crates.io. */
  badges: unknown[];
  /** ISO timestamp when crate was first published. */
  created_at: string;
  /** Total crate downloads. */
  downloads: number;
  /** Recent crate downloads when provided by crates.io. */
  recent_downloads: number | null;
  /** Highest non-yanked version selected by crates.io. */
  max_version: string;
  /** Newest published version. */
  newest_version: string;
  /** Highest stable version when known. */
  max_stable_version: string | null;
  /** Crate description from Cargo.toml metadata. */
  description: string | null;
  /** Project homepage URL. */
  homepage: string | null;
  /** Documentation URL. */
  documentation: string | null;
  /** Source repository URL. */
  repository: string | null;
  /** Relative crates.io API links for related resources. */
  links: {
    /** Version downloads endpoint. */
    version_downloads: string;
    /** Versions endpoint. */
    versions: string;
    /** Owners endpoint. */
    owners: string;
    /** Team owner endpoint. */
    owner_team: string;
    /** User owner endpoint. */
    owner_user: string;
    /** Reverse dependencies endpoint. */
    reverse_dependencies: string;
  };
  /** Whether search result exactly matched the query. */
  exact_match: boolean;
}

/** Response returned by crates.io crate search. */
export interface CratesSearchResult {
  /** Crates matching the search query. */
  crates: CrateSummary[];
  /** Pagination metadata. */
  meta: {
    /** Total matching crates. */
    total: number;
    /** Next page URL when crates.io includes one. */
    next_page?: string | null;
    /** Previous page URL when crates.io includes one. */
    prev_page?: string | null;
  };
}
