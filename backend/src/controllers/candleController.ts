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

  const candleName = candleQuery.candleName;

  const candleStyle = candleQuery.candleStyle;

  const fragranceArray = candleQuery.fragrances;

  const where: any = {};

  if (fragranceArray && fragranceArray.length > 0) {
    where.AND = generateAND(fragranceArray);
  }

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

  try {
    const findCandles = await prisma.candles.findMany({
      relationLoadStrategy: "join",
      where: where,
      select: {
        candle_name: true,
        candle_style: true,
      },
    });

    if (findCandles.length == 0) {
      return res.status(200).json({ noresults: "No Results Found" });
    }

    return res.json({ query: findCandles });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "PrismaClientKnownRequestError") {
        return res.status(400).json({
          error: error.message,
        });
      }

      if (error.name === "PrismaClientValidationError") {
        return res.status(500).json({
          error: error.message,
        });
      }
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
