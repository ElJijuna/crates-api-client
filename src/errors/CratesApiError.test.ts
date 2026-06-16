import { CratesApiError } from './CratesApiError';

describe('CratesApiError', () => {
  it('is an instance of Error', () => {
    const err = new CratesApiError(404, 'Not Found');
    expect(err).toBeInstanceOf(Error);
  });

  it('is an instance of CratesApiError', () => {
    const err = new CratesApiError(404, 'Not Found');
    expect(err).toBeInstanceOf(CratesApiError);
  });

  it('has the correct name', () => {
    const err = new CratesApiError(404, 'Not Found');
    expect(err.name).toBe('CratesApiError');
  });

  it('exposes status and statusText', () => {
    const err = new CratesApiError(404, 'Not Found');
    expect(err.status).toBe(404);
    expect(err.statusText).toBe('Not Found');
  });

  it('message includes status and statusText', () => {
    const err = new CratesApiError(404, 'Not Found');
    expect(err.message).toContain('404');
    expect(err.message).toContain('Not Found');
  });

  it('can be caught as Error', () => {
    const throwIt = () => {
      throw new CratesApiError(500, 'Internal Server Error');
    };
    expect(throwIt).toThrow(Error);
  });
});
