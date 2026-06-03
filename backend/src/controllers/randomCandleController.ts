import type { Request, Response } from "express";
import { db } from '../db/database.js';
import { sql } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export async function getRandomCandle(req: Request, res: Response) {
    try {
        const randomCandle = await db
            .selectFrom('candles as c')
            .select([
                'c.candle_name', 
                'c.candle_style', 
                'c.candle_description', 
                'c.candle_brand', 
                'c.candle_image_url',
                (eb) => jsonArrayFrom(
                    eb.selectFrom('candles_fragrances as cf')
                      .innerJoin('fragrances as f', 'cf.fragrance_id', 'f.fragrance_id')
                      .select('f.fragrance_name')
                      .whereRef('cf.candle_id', '=', 'c.candle_id')
                ).as('fragrances')
            ])
            .orderBy(sql`RANDOM()`)
            .limit(1)
            .executeTakeFirst();

        if (!randomCandle) {
            return res.status(404).json({ error: "No candles found" });
        }

        return res.status(200).json(randomCandle);
    } catch (error) {
        return res.status(500).json({ "error": "internal server error" });
    }
}