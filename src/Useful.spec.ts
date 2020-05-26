import { isCross, isSquare, isTriangle } from './Useful';

describe('isCross', () => {
  it('is defined', () => {
    expect(isCross).toBeDefined();
  });
  it('can recognize a cross', () => {
    // Logical cross
    let points = [2.0, 0.0, 2.0, 4.0, -99, -99, 0.0, 2.0, 4.0, 2.0];
    expect(isCross(points)).toEqual(true);

    // Not a cross
    points = [2.0, 0.0, 2.0, 4.0, -99, -99, 0.0, 4.0, 4.0, 4.0];
    expect(isCross(points)).toEqual(false);

    // Cross on 0-4-8
    points = [4, 0, 4, 8, -99, -99, 0, 4, 8, 4];
    expect(isCross(points)).toEqual(true);

    // Cross with other start point
    points = [2.0, 4.0, 2.0, 0.0, -99, -99, 0.0, 2.0, 4.0, 2.0];
    expect(isCross(points)).toEqual(true);
  });
});

describe('isSquare', () => {
  it('is defined', () => {
    expect(isSquare).toBeDefined();
  });
  it('can recognize a square', () => {
    // Logical square
    let points = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0];
    expect(isSquare(points)).toEqual(true);

    // Inverted square
    points = [0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    expect(isSquare(points)).toEqual(true);

    // Not a square
    points = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    expect(isSquare(points)).toEqual(false);

    // Square on 0-2
    points = [0, 0, 2, 0, 2, 2, 0, 2, 0, 0];
    expect(isSquare(points)).toEqual(true);

    // Square with other start point.
    points = [1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0];
    expect(isSquare(points)).toEqual(true);
  });
});

describe('isTriangle', () => {
  it('is defined', () => {
    expect(isTriangle).toBeDefined();
  });
  it('can recognize a triangle', () => {
    // Logical triangle
    let points = [1.0, 0.0, 2.0, 2.0, 0.0, 2.0, 1.0, 0.0];
    expect(isTriangle(points)).toEqual(true);

    // Not a Triangle
    points = [1.0, 0.0, 2.0, 2.0, 2.0, 4.0, 0.0, 0.0];
    expect(isTriangle(points)).toEqual(false);

    // Triangle on 0-4-8
    points = [2, 0, 4, 4, 0, 4, 2, 0];
    expect(isTriangle(points)).toEqual(true);

    // Triangle with other start point
    points = [2.0, 2.0, 0.0, 2.0, 1.0, 0.0, 2.0, 2.0];
    expect(isTriangle(points)).toEqual(true);
  });
});
