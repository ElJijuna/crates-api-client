export type CratesSort = 'alpha' | 'downloads' | 'recent-downloads' | 'recent-updates' | 'new';

export interface CratesSearchParams {
  query?: string;
  page?: number;
  perPage?: number;
  sort?: CratesSort;
}

export interface CrateSummary {
  id: string;
  name: string;
  updated_at: string;
  versions: number[] | null;
  keywords: string[];
  categories: string[];
  badges: unknown[];
  created_at: string;
  downloads: number;
  recent_downloads: number | null;
  max_version: string;
  newest_version: string;
  max_stable_version: string | null;
  description: string | null;
  homepage: string | null;
  documentation: string | null;
  repository: string | null;
  links: {
    version_downloads: string;
    versions: string;
    owners: string;
    owner_team: string;
    owner_user: string;
    reverse_dependencies: string;
  };
  exact_match: boolean;
}

export interface CratesSearchResult {
  crates: CrateSummary[];
  meta: {
    total: number;
    next_page?: string | null;
    prev_page?: string | null;
  };
}
