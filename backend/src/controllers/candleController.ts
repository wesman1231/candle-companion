import type { Request, Response } from "express";
import { db } from '../db/database.js'
import { sql } from "kysely";

export async function getCandles(req: Request, res: Response) {
  type CandleStyle =
    | "Jar"
    | "Two-Wick"
    | "Large Tumbler"
    | "Three Wick"
    | "Medium Pillar"
    | "Small Tumbler"
    | "Mini"
    | "Not Listed";

  type CandleQuery = {
    candleName?: string;
    candleStyle?: CandleStyle;
    fragrances?: string[];
  };

  const candleQuery: CandleQuery = req.body.candleQuery;

  const candleName = candleQuery.candleName;

  const candleStyle = candleQuery.candleStyle;

  const fragranceArray = candleQuery.fragrances;

  //TODO: dynamically build query based on what search paramaters are present

  let query;

  if(fragranceArray){
    query = await db.selectFrom('candles as c')
    .select(['candle_name', 'candle_style'])
    .innerJoin('candles_fragrances as cf', 'cf.candle_id', 'c.candle_id')
    .innerJoin('fragrances as f', 'f.fragrance_id', 'cf.fragrance_id')
    .where('f.fragrance_name', 'in', fragranceArray)
    .groupBy(['c.candle_name', 'c.candle_style'])
    .having(sql<number>`count(distinct fragrance_name)`, '=', fragranceArray.length)
    .execute()
  }

  return res.status(200).json({result: query})
}
