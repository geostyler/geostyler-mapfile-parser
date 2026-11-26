import { describe, expect, it } from 'vitest';
import { stringifyMapfileLayer } from './stringifyMapfile';

describe('stringifyMapfileLayer', () => {
  it('writes the blocks with indentation and END', () => {
    const text = stringifyMapfileLayer({
      name: 'buildings',
      classes: [
        {
          name: 'all',
          styles: [
            {
              color: '#FF0000',
              outlinecolor: '#00000040',
              width: 2,
              linecap: 'butt',
              linejoin: 'miter',
            },
          ],
        },
      ],
    });
    expect(text).toBe(
      [
        'LAYER',
        '  NAME "buildings"',
        '  CLASS',
        '    NAME "all"',
        '    STYLE',
        '      COLOR "#FF0000"',
        '      OUTLINECOLOR "#00000040"',
        '      WIDTH 2',
        '      LINECAP BUTT',
        '      LINEJOIN MITER',
        '    END',
        '  END',
        'END',
        '',
      ].join('\n'),
    );
  });

  it('writes no NAME when the name is undefined', () => {
    expect(stringifyMapfileLayer({ classes: [] })).toBe('LAYER\nEND\n');
  });
});
