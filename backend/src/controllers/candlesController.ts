import type { Request, Response } from 'express';
import { db } from '../db/dbInstance';
import type { Candle, Fragrance, CandleFragrance } from '../db/dbTypes';

export const searchCandles = async (req: Request, res: Response) => {
  const name = req.query.name ? String(req.query.name) : undefined;
  const brand = req.query.brand ? String(req.query.brand) : undefined;
  const rawFragrances = req.query.fragrances

  const fragrances = Array.isArray(rawFragrances)
    ? rawFragrances
    : rawFragrances
      ? [rawFragrances]
      : [];


  let query = db.selectFrom('candles as c')
    .innerJoin('candles_fragrances as cf', 'c.candle_id', 'cf.candle_id')
    .innerJoin('fragrances as f', 'cf.fragrance_id', 'f.fragrance_id')
    .select(['c.candle_id', 'c.candle_name', 'c.candle_thumbnail', 'c.candle_brand'])

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

  if(!name && !brand && fragrances.length === 0) {
    return res.status(400).json({ message: 'At least one search parameter (name, brand, or fragrances) must be provided.' });
  }

  if (results.length === 0) {
    return res.status(200).json({ results: results, message: 'No candles found matching the search criteria.' });
  }

  if (results.length > 0) {
    return res.status(200).json({ results: results });
  }

  return res.status(500).json({ message: 'An unexpected error occurred' });
};