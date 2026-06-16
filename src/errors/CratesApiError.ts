export class CratesApiError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`crates.io API error: ${status} ${statusText}`);
    this.name = 'CratesApiError';
    this.status = status;
    this.statusText = statusText;
    Object.setPrototypeOf(this, CratesApiError.prototype);
  }
}
