import { checkComment } from './checkComment';

const expectedReturnShape = {
  includesComment: expect.any(Boolean),
  comment: expect.any(String),
  contentWithoutComment: expect.any(String)
}

describe('checkComment', () => {
  it('is defined', () => {
    expect(checkComment).toBeDefined();
  });
  it('is a function', () => {
    expect(checkComment).toBeInstanceOf(Function);
  });
  it('returns a line object', () => {
    const got = checkComment('');
    expect(got).toMatchObject(expectedReturnShape);
  });
  it('detects an inline comment', () => {
    const got = checkComment('END # foo comment');
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.includesComment).toEqual(true);
    expect(got.comment).toEqual('foo comment');
    expect(got.contentWithoutComment).toEqual('END');
  });
  it('works on lines with hex colors wo/ an inline comment', () => {
    const got = checkComment('COLOR "#BADA55"');
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.includesComment).toEqual(false);
    expect(got.comment).toEqual('');
    expect(got.contentWithoutComment).toEqual('COLOR "#BADA55"');
  });
  it('works on lines with hex colors w/ an inline comment', () => {
    const got = checkComment('COLOR "#DEADBEEF" # baz comment');
    expect(got).toMatchObject(expectedReturnShape);
    expect(got.includesComment).toEqual(true);
    expect(got.comment).toEqual('baz comment');
    expect(got.contentWithoutComment).toEqual('COLOR "#DEADBEEF"');
  });
});
