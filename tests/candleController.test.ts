
import { describe, test, expect } from 'vitest';
import { db } from '../backend/src/db/dbInstance';

describe('Should modify the query based on what filters are passed in', () => {
  test('Should modify the query based on what filters are passed in', () => {
    const name = 'Test Candle';
    const brand = 'Test Brand';
    const fragrances = ['Lavender', 'Vanilla'];

    let query = db
      .selectFrom('candles as c')
      .innerJoin('candles_fragrances as cf', 'c.candle_id', 'cf.candle_id')
      .innerJoin('fragrances as f', 'cf.fragrance_id', 'f.fragrance_id')
      .select([
        'c.candle_id',
        'c.candle_name',
        'c.candle_thumbnail',
        'c.candle_brand',
      ]);

    if (name) {
      query = query.where('c.candle_name', '=', name);

      const compiled = query.compile();

      expect(compiled.sql).toContain('candle_name');
      expect(compiled.sql).toContain('=');
      expect(compiled.parameters).toContain(name);
    }

    if (brand) {
      query = query.where('c.candle_brand', '=', brand);

      const compiled = query.compile();

      expect(compiled.sql).toContain('candle_brand');
      expect(compiled.sql).toContain('=');
      expect(compiled.parameters).toContain(brand);
    }

    if (fragrances.length > 0) {
      query = query.where('f.fragrance_name', 'in', fragrances);

      const compiled = query.compile();

      expect(compiled.sql).toContain('fragrance_name');
      expect(compiled.sql.toLowerCase()).toContain('in');
      expect(compiled.parameters).toEqual(
        expect.arrayContaining(fragrances),
      );

      query = query
        .groupBy([
          'c.candle_id',
          'c.candle_name',
          'c.candle_thumbnail',
          'c.candle_brand',
        ])
        .having((eb) =>
          eb(
            eb.fn.count('f.fragrance_name').distinct(),
            '=',
            fragrances.length,
          ),
        );

      const finalCompiled = query.compile();

      expect(finalCompiled.sql.toLowerCase()).toContain('group by');
      expect(finalCompiled.sql.toLowerCase()).toContain('having');
      expect(finalCompiled.sql.toLowerCase()).toContain('count');
      expect(finalCompiled.parameters).toContain(fragrances.length);
    }
  });
});
