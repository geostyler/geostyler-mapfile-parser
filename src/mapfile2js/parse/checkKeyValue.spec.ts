import { checkKeyValue} from './checkKeyValue';
import { LineObject } from '../parseMapfile';

describe('checkKeyValue', () => {
  it('is defined', () => {
    expect(checkKeyValue).toBeDefined();
  });
  it('is a function', () => {
    expect(checkKeyValue).toBeInstanceOf(Function);
  });
  it('returns a line object', () => {
    const got = checkKeyValue({contentWithoutComment: ''} as LineObject);
    expect(got).toMatchObject({} as LineObject);
  });
  it('handles key only lines properly', () => {
    const got = checkKeyValue({contentWithoutComment: 'MAP'} as LineObject);
    expect(got.key).toBe('map');
    expect(got.value).toBe(undefined);
  });
  it('handles key/value lines properly', () => {
    const got = checkKeyValue({contentWithoutComment: 'IMAGETYPE PNG'} as LineObject);
    expect(got.key).toBe('imagetype');
    expect(got.value).toBe('PNG');
  });
  it('removes quotes around most values', () => {
    const got = checkKeyValue({contentWithoutComment: 'COLOR "#DEADBEEF"'} as LineObject);
    expect(got.key).toBe('color');
    expect(got.value).toBe('#DEADBEEF');
  });
  it('leaves quotes untouched for EXPRESSION values', () => {
    const got = checkKeyValue({contentWithoutComment: 'EXPRESSION "2005"'} as LineObject);
    expect(got.key).toBe('expression');
    expect(got.value).toBe('"2005"');
  });
});
