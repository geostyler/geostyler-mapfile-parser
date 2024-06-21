import { expect, it, describe } from 'vitest';

import { checkBlockKey } from './checkBlockKey';

describe('checkBlockKey', () => {
  it('is defined', () => {
    expect(checkBlockKey).toBeDefined();
  });
  it('is a function', () => {
    expect(checkBlockKey).toBeInstanceOf(Function);
  });
  it('returns a line object', () => {
    const got = checkBlockKey({
      key: 'MAP',
      value: undefined,
    } as any);
    expect(got).toMatchObject({} as any);
  });
  it('detects key only blocks', () => {
    const got = checkBlockKey({
      key: 'MAP',
      value: undefined,
    } as any);
    expect(got.isBlockKey).toBe(true);
    expect(got.isBlockLine).toBe(false);
  });
  it('detects single line blocks', () => {
    const got = checkBlockKey({
      key: 'PATTERN',
      value: '10 10 END',
    } as any);
    expect(got.isBlockKey).toBe(true);
    expect(got.isBlockLine).toBe(true);
  });
  it('does not report END as block', () => {
    const got = checkBlockKey({
      key: 'END',
      value: undefined,
    } as any);
    expect(got.isBlockKey).toBe(false);
    expect(got.isBlockLine).toBe(false);
  });
  it('does not report projection as block', () => {
    const got = checkBlockKey({
      key: 'init=epsg:4326',
      value: undefined,
    } as any);
    expect(got.isBlockKey).toBe(false);
    expect(got.isBlockLine).toBe(false);
  });
});
