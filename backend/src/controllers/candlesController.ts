import type { Request, Response } from 'express';
import { db } from '../db/dbInstance';
import type { Candle, Fragrance, CandleFragrance } from '../db/dbTypes';

export const getCandles = async (req: Request, res: Response) => {
  const {name, fragrances, brand} = req.query;
  
  if (typeof name !== 'string') {
      return res.status(400).json({ error: 'Query parameter "name" must be a single string.' });
    }
  
  if(!fragrances && !brand) {
    const nameQuery = await db.selectFrom('candles as c')
      .innerJoin('candles_fragrances as cf', 'c.candle_id', 'cf.candle_id')
      .innerJoin('fragrances as f', 'cf.fragrance_id', 'f.fragrance_id')
      .select(['c.candle_id', 'c.candle_name', 'c.candle_thumbnail', 'c.candle_brand', 'f.fragrance_id', 'f.fragrance_name'])
      .where('c.candle_name', '=', name)

      return res.status(200).json(nameQuery);
  }
};