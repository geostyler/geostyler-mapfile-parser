import { isCross, isSquare, isTriangle } from './Useful';

describe('isCross', () => {
  it('is defined', () => {
    expect(isCross).toBeDefined();
  });
  it('can recognize a cross', () => {
    const points = [2.0, 0.0, 2.0, 4.0, -99, -99, 0.0, 2.0, 4.0, 2.0];
    expect(isCross(points)).toEqual(true);
  });
});

describe('isSquare', () => {
  it('is defined', () => {
    expect(isSquare).toBeDefined();
  });
  it('can recognize a sqare', () => {
    const points = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0];
    expect(isSquare(points)).toEqual(true);
  });
});

describe('isTriangle', () => {
  it('is defined', () => {
    expect(isTriangle).toBeDefined();
  });
  it('can recognize a triangle', () => {
    const points = [1.0, 0.0, 2.0, 2.0, 0.0, 2.0, 1.0, 0.0];
    expect(isTriangle(points)).toEqual(true);
  });
});
