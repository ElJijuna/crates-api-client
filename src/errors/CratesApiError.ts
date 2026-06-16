/** Error thrown when crates.io returns a non-2xx HTTP response. */
export class CratesApiError extends Error {
  /** HTTP status code returned by crates.io. */
  readonly status: number;

  /** HTTP status text returned by crates.io. */
  readonly statusText: string;

  /** Create an API error from HTTP response status fields. */
  constructor(status: number, statusText: string) {
    super(`crates.io API error: ${status} ${statusText}`);
    this.name = 'CratesApiError';
    this.status = status;
    this.statusText = statusText;
    Object.setPrototypeOf(this, CratesApiError.prototype);
  }
}
