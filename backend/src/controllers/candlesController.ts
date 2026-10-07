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

      return res.status(200).json(nameQuery);
  }
};