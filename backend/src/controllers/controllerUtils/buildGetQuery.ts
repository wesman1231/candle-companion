import type { CandleStyle } from '../candleController.js';
import { db } from '../../db/database.js';
import { sql } from "kysely";

export function buildGetQuery(candleName: string | undefined, candleStyle: CandleStyle | undefined, fragranceArray: string[] | undefined, limit: number, offset: number) {
    const query = db
      .selectFrom("candles as c")
      .select(["candle_name", "candle_style"])

      .$if(candleName !== undefined && candleName !== null, (qb) =>
        qb.where("c.candle_name", "=", candleName as string),
      )

      .$if(candleStyle !== undefined && candleStyle !== null, (qb) =>
        qb.where("c.candle_style", "=", candleStyle as CandleStyle),
      )

      .$if(fragranceArray !== undefined && fragranceArray !== null, (qb) =>
        qb
          .innerJoin("candles_fragrances as cf", "cf.candle_id", "c.candle_id")
          .innerJoin("fragrances as f", "f.fragrance_id", "cf.fragrance_id")
          .where("f.fragrance_name", "in", fragranceArray as string[]),
      )

      .groupBy(["c.candle_name", "c.candle_style"])

      .$if(fragranceArray !== undefined && fragranceArray !== null, (qb) =>
        qb.having(
          sql<number>`count(distinct fragrance_name)`,
          "=",
          fragranceArray!.length,
        ),
      )

      .limit(limit)

      .offset(offset);
    return query;
  }