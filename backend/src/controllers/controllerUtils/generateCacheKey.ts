import type { Candle } from '../../controllers/candleController.js';
import crypto from 'crypto';

export function generateCacheKey(candle: Candle){
    const candleName = candle.candleName?.toLowerCase();
    const candleStyle = candle.candleStyle;
    const fragranceArray = candle.fragrances;
    let sortedFragrances: string[] | undefined;
    if(fragranceArray){
        sortedFragrances = fragranceArray.sort();
    }

    const textToHash = `candle_query:candle_name:${candleName}:candle_style:${candleStyle}:candle_fragrances:${sortedFragrances}`
    const hashKey = crypto.createHash('md5').update(textToHash).digest('hex');
    return hashKey;
}