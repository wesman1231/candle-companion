import type { Request, Response } from "express";

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
    fragrances: string[];
  };

  const candleQuery: CandleQuery = req.body.candleQuery;

  const candleName = candleQuery.candleName;

  const candleStyle = candleQuery.candleStyle;

  const fragranceArray = candleQuery.fragrances;

  
}
