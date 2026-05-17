import type { Request, Response } from "express";
import type { Database } from '../db/schema.js'
import { db } from '../db/database.js'
import { sql } from "kysely";

export async function getCandles(req: Request, res: Response) {
  type CandleStyle = Database['candles']['candle_style']

  type CandleQuery = {
    candleName?: string;
    candleStyle?: CandleStyle;
    fragrances?: string[];
    limit?: number;
    page: number
  };

  const validCandleStyles = ['jar', 'large lumbler', 'small lumbler', 'three-wick', 'mini'];

  const candleQuery: CandleQuery = req.body.candleQuery;

  const candleName = candleQuery.candleName?.toLowerCase();

  const candleStyle = candleQuery.candleStyle;

  const fragranceArray = candleQuery.fragrances;

  const limit = candleQuery.limit || 10

  const page = candleQuery.page || 1

  let offset = page * limit;

  if(page === 1){
    offset = 0
  }

  try{
    const query = await db.selectFrom('candles as c')
                .select(['candle_name', 'candle_style'])
                
                .$if(candleName !== undefined && candleName !== null, (qb) =>
                    qb.where('c.candle_name', '=', candleName as string)
                )

                .$if(candleStyle !== undefined && candleStyle !== null, (qb) => 
                    qb.where('c.candle_style', '=', candleStyle as CandleStyle)
                )

                .$if(fragranceArray !== undefined && fragranceArray !== null, (qb) => 
                    qb.innerJoin('candles_fragrances as cf', 'cf.candle_id', 'c.candle_id')
                    .innerJoin('fragrances as f', 'f.fragrance_id', 'cf.fragrance_id')
                    .where('f.fragrance_name', 'in', fragranceArray as string[])
                )
                
                .groupBy(['c.candle_name', 'c.candle_style'])
                
                .$if(fragranceArray !== undefined && fragranceArray !== null, (qb) =>
                    qb.having(sql<number>`count(distinct fragrance_name)`, '=', fragranceArray!.length)
                )

                .limit(limit)

                .offset(offset)

                .execute()
        
        
        if(req.body === undefined){
            return res.status(400).json({error: 'Bad Request'});
        }

        if(candleName && typeof candleName !== 'string'){
            return res.status(400).json({error: 'Bad Request'});
        }

        if(candleStyle && !validCandleStyles.includes(candleStyle)){
            return res.status(400).json({error: 'Bad Request'});
        }

        if(fragranceArray && fragranceArray.every(item => typeof item !== 'string')){
            return res.status(400).json({error: 'Bad Request'});
        }
        
        if(query.length === 0){
            return res.status(200).json({message: 'No Results Found'});
        }

        return res.status(200).json({result: query})
    }
    catch(error){
        return res.status(500).json({error: 'Internal Server'})
    }
}
