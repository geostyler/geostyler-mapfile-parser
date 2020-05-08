import { checkBlockKey } from './checkBlockKey';

const expectedReturnShape = {
  isBlockKey: expect.any(Boolean),
  isBlockLine: expect.any(Boolean)
}

describe('checkBlockKey', () => {
  it('is defined', () => {
    expect(checkBlockKey).toBeDefined();
  });
  it('is a function', () => {
    expect(checkBlockKey).toBeInstanceOf(Function);
  });
  it('returns a line object', () => {
    const got = checkBlockKey({
      isKeyOnly: true,
      key: 'MAP',
      value: ''
    });
    expect(got).toMatchObject(expectedReturnShape);
  });
  it('detects key only blocks', () => {
    const got = checkBlockKey({
      isKeyOnly: true,
      key: 'MAP',
      value: ''
    });
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.isBlockKey).toBe(true);
    expect(got.isBlockLine).toBe(false);
  });
  it('detects single line blocks', () => {
    const got = checkBlockKey({
      isKeyOnly: false,
      key: 'PATTERN',
      value: '10 10 END'
    });
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.isBlockKey).toBe(true);
    expect(got.isBlockLine).toBe(true);
  });
  it('does not report END as block', () => {
    const got = checkBlockKey({
      isKeyOnly: true,
      key: 'END',
      value: ''
    });
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.isBlockKey).toBe(false);
    expect(got.isBlockLine).toBe(false);
  });

  // TODO add test for PROJECTION / "init=epsg:4326" special handling
});
