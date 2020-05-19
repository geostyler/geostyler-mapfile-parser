import { checkBlockKey } from './checkBlockKey';
import { LineObject } from '../parse';

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
    } as LineObject);
    expect(got).toMatchObject({} as LineObject);
  });
  it('detects key only blocks', () => {
    const got = checkBlockKey({
      key: 'MAP',
      value: undefined,
    } as LineObject);
    expect(got.isBlockKey).toBe(true);
    expect(got.isBlockLine).toBe(false);
  });
  it('detects single line blocks', () => {
    const got = checkBlockKey({
      key: 'PATTERN',
      value: '10 10 END',
    } as LineObject);
    expect(got.isBlockKey).toBe(true);
    expect(got.isBlockLine).toBe(true);
  });
  it('does not report END as block', () => {
    const got = checkBlockKey({
      key: 'END',
      value: undefined,
    } as LineObject);
    expect(got.isBlockKey).toBe(false);
    expect(got.isBlockLine).toBe(false);
  });
  it('does not report projection as block', () => {
    const got = checkBlockKey({
      key: 'init=epsg:4326',
      value: undefined,
    } as LineObject);
    expect(got.isBlockKey).toBe(false);
    expect(got.isBlockLine).toBe(false);
  });
});
