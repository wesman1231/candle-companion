import type { Request, Response } from "express";
import { prisma } from "../db/lib/prisma.js";

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

  const fragranceArray = candleQuery.fragrances;

  console.log(fragranceArray);

  function generateAND(fragranceArray: string[]) {
    const AND: object[] = [];
    fragranceArray.map((fragrance) => {
      AND.push({
        candles_fragrances: {
          some: {
            fragrances: {
              fragrance_name: fragrance,
            },
          },
        },
      });
    });
    console.log(AND);
    return AND;
  }

  const findCandles = await prisma.candles.findMany({
    relationLoadStrategy: "join",
    where: {
      AND: generateAND(fragranceArray),
    },
    select: {
      candle_name: true,
      candle_style: true,
    },
  });

  return res.json({ query: findCandles });
}
