import type { Request, Response } from 'express';
import { db } from '../db/dbInstance.ts';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type { Candle, Fragrance, CandleFragrance } from '../db/dbTypes';

export const searchCandles = async (req: Request, res: Response) => {
  try {
    const name = req.query.name ? String(req.query.name) : undefined;
    const brand = req.query.brand ? String(req.query.brand) : undefined;
    const rawFragrances = req.query.fragrances;

    const fragrances = Array.isArray(rawFragrances)
      ? rawFragrances
      : rawFragrances
        ? [rawFragrances]
        : [];

    let query = db.selectFrom('candles as c')
      .innerJoin('candles_fragrances as cf', 'c.candle_id', 'cf.candle_id')
      .innerJoin('fragrances as f', 'cf.fragrance_id', 'f.fragrance_id')
      .select(['c.candle_id', 'c.candle_name', 'c.candle_thumbnail', 'c.candle_brand']);

    if (name) {
      query = query.where('c.candle_name', '=', name);
    }

    if (brand) {
      query = query.where('c.candle_brand', '=', brand);
    }

    if (fragrances.length > 0) {
      query = query.where('f.fragrance_name', 'in', fragrances as string[]);
      query = query.groupBy(['c.candle_id', 'c.candle_name', 'c.candle_thumbnail', 'c.candle_brand']);
      query = query.having((eb) => eb(eb.fn.count('f.fragrance_name').distinct(), '=', fragrances.length));
    }

    const results = await query.execute();

    if (results.length === 0) {
      return res.status(200).json({ results: results, message: 'No candles found matching the search criteria.' });
    }

    return res.status(200).json({ results: results });

  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};


export const getCandleById = async (req: Request, res: Response) => {
  try {
    const candleId = req.params.id ? String(req.params.id) : undefined;

    const candle = await db
      .selectFrom('candles as c')
      .select((eb) => [
        'c.candle_id',
        'c.candle_name',
        'c.candle_thumbnail',
        'c.candle_brand',
        jsonArrayFrom(
          eb
            .selectFrom('candles_fragrances as cf')
            .innerJoin(
              'fragrances as f',
              'cf.fragrance_id',
              'f.fragrance_id'
            )
            .select(['f.fragrance_name', 'f.fragrance_id'])
            .whereRef('cf.candle_id', '=', 'c.candle_id')
        ).as('fragrances'),
      ])
      .where('c.candle_id', '=', candleId!)
      .executeTakeFirst();

    if (!candleId) {
      return res.status(400).json({ message: '400: Candle ID is required.' });
    }

    if (!candle) {
      return res.status(404).json({ message: '404: Candle not found.' });
    }

    return res.status(200).json({ results: candle });
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};
