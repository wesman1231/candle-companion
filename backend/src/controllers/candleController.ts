import type { Request, Response } from "express";
import type { Database } from "../db/schema.js";
import { buildGetQuery } from "./controllerUtils/buildGetQuery.js";
import { generateCacheKey } from './controllerUtils/generateCacheKey.js'
import { readFromCache } from './controllerUtils/readQueryFromCache.js';
import { addToCache } from './controllerUtils/addQueryToCache.js'

export type CandleStyle = Database["candles"]["candle_style"];

export type CandleQuery = {
  candleName?: string;
  candleStyle?: CandleStyle;
  fragrances?: string[];
  limit?: number;
  page?: number;
};
//TODO: ADD CACHE CHECKING.GENERATE CACHE KEY WITH QUERY USING SEPARATE FUNCTION, CHECK FOR THAT KEY, IF IT DOESN'T EXIST, QUERY DB AND SET IT IN CACHE
export async function getCandles(req: Request, res: Response) {
  const validCandleStyles = [
    "jar",
    "large lumbler",
    "small lumbler",
    "three-wick",
    "mini",
  ];

  const candleQuery: CandleQuery = req.body.candleQuery;

  const candleName = candleQuery.candleName?.toLowerCase();

  const candleStyle = candleQuery.candleStyle;

  const fragranceArray = candleQuery.fragrances;

  const limit = candleQuery.limit || 10;

  const page = candleQuery.page || 1;

  let offset = page * limit;

  if (page === 1) {
    offset = 0;
  }

  await executeQuery();

  async function executeQuery() {
    if (candleStyle && !validCandleStyles.includes(candleStyle)) {
      return res.status(400).json({ error: "Bad Request" });
    }
    
    const cacheKey = generateCacheKey(candleQuery);
    const cacheResult = await readFromCache(cacheKey);

    if(cacheResult !== null){
      return res.status(200).json(cacheResult)
    }

    try {
      const execute = await buildGetQuery(
        candleName,
        candleStyle,
        fragranceArray,
        limit,
        offset,
      ).execute();

      if (execute.length === 0) {
        return res.status(200).json({ message: "No Results Found" });
      }
      addToCache(cacheKey, execute);
      return res.status(200).json({ result: execute });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server" });
    }
  }
}
