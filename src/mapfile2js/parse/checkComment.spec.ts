import { checkComment } from './checkComment';
import { LineObject } from '../parse';

describe('checkComment', () => {
  it('is defined', () => {
    expect(checkComment).toBeDefined();
  });
  it('is a function', () => {
    expect(checkComment).toBeInstanceOf(Function);
  });
  it('returns a line object', () => {
    const got = checkComment({ content: '' } as LineObject);
    expect(got).toMatchObject({} as LineObject);
  });
  it('detects an inline comment', () => {
    const got = checkComment({ content: 'END # foo comment' } as LineObject);
    expect(got.comment).toEqual('foo comment');
    expect(got.contentWithoutComment).toEqual('END');
  });
  it('works on lines with hex colors wo/ an inline comment', () => {
    const got = checkComment({ content: 'COLOR "#BADA55"' } as LineObject);
    expect(got.comment).toEqual(undefined);
    expect(got.contentWithoutComment).toEqual('COLOR "#BADA55"');
  });
  it('works on lines with hex colors w/ an inline comment', () => {
    const got = checkComment({ content: 'COLOR "#DEADBEEF" # baz comment' } as LineObject);
    expect(got.comment).toEqual('baz comment');
    expect(got.contentWithoutComment).toEqual('COLOR "#DEADBEEF"');
  });
});
