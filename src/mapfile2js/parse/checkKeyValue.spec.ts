import { checkKeyValue, KeyValueLineObject } from './checkKeyValue';

const expectedReturnShape: KeyValueLineObject = {
  isKeyOnly: expect.any(Boolean),
  key: expect.any(String),
  value: expect.any(String)
}

describe('checkKeyValue', () => {
  it('is defined', () => {
    expect(checkKeyValue).toBeDefined();
  });
  it('is a function', () => {
    expect(checkKeyValue).toBeInstanceOf(Function);
  });
  it('returns a KeyValueLineObject', () => {
    const got = checkKeyValue('');
    expect(got).toMatchObject(expectedReturnShape);
  });
  it('handles key only lines properly', () => {
    const got = checkKeyValue('MAP');
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.isKeyOnly).toBe(true);
    expect(got.key).toBe('MAP');
    expect(got.value).toBe('');
  });
  it('handles key/value lines properly', () => {
    const got = checkKeyValue('IMAGETYPE PNG');
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.isKeyOnly).toBe(false);
    expect(got.key).toBe('IMAGETYPE');
    expect(got.value).toBe('PNG');
  });
  it('removes quotes around most values', () => {
    const got = checkKeyValue('COLOR "#DEADBEEF"');
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.isKeyOnly).toBe(false);
    expect(got.key).toBe('COLOR');
    expect(got.value).toBe('#DEADBEEF');
  });
  it('leaves quotes untouched for EXPRESSION values', () => {
    const got = checkKeyValue('EXPRESSION "2005"');
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.isKeyOnly).toBe(false);
    expect(got.key).toBe('EXPRESSION');
    expect(got.value).toBe('"2005"');
  });
});